import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const env = await readFile(path.join(root, ".env.local"), "utf8");
const apiKey = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!apiKey) throw new Error("OPENAI_API_KEY is missing from .env.local");

const [schema, sample] = await Promise.all([
  readFile(path.join(root, "data/analysis-schema.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "data/sample-input.json"), "utf8").then(JSON.parse),
]);

const instructions = `You are Stateside, a housing decision assistant for international students comparing rentals they already found.

Analyze only the supplied listing text and landlord messages. Return only the agreed structured output.

Hard rules:
- Never invent location, transit, landlord, or property facts.
- Never convert an unknown into a reassuring inference.
- Never declare a property, person, or neighborhood safe.
- Never use race, national origin, neighborhood demographics, or income as a proxy for anything.
- Never give legal or immigration conclusions.
- Never guarantee approval or legitimacy.
- Explain in plain language why every caution matters.
- Treat an explicit listing or message statement as confirmed, a direct interpretation as inferred, and absent information as unknown.
- Preserve contradictions and hidden lease terms prominently.
- Do not calculate totals or lease durations. Extract stated numeric amounts and dates only; application code performs arithmetic and date math.
- Use exactly one action lane per place.
- Use the stop lane only when the supplied evidence supports pausing before any payment.`;

const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-5.6",
    reasoning: { effort: "medium" },
    instructions,
    input: JSON.stringify(sample),
    text: {
      verbosity: "medium",
      format: {
        type: "json_schema",
        name: "stateside_analysis",
        strict: true,
        schema,
      },
    },
  }),
});

if (!response.ok) {
  const detail = await response.text();
  throw new Error(`OpenAI request failed (${response.status}): ${detail.slice(0, 500)}`);
}

const result = await response.json();
const outputText = result.output_text ?? result.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
if (!outputText) throw new Error("The response did not contain structured output text");

const analysis = JSON.parse(outputText);
await mkdir(path.join(root, "fixtures"), { recursive: true });
await writeFile(path.join(root, "fixtures/analysis.json"), `${JSON.stringify(analysis, null, 2)}\n`);
console.log(`Saved GPT-5.6 fixture with ${analysis.places.length} places.`);
