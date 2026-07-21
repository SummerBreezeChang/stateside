import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const env = await readFile(path.join(root, ".env.local"), "utf8");
const apiKey = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!apiKey) throw new Error("OPENAI_API_KEY is missing from .env.local");

const [schema, listings] = await Promise.all([
  readFile(path.join(root, "data/analysis-schema.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "fixtures/listings.json"), "utf8").then(JSON.parse),
]);

const sample = {
  student: listings.student,
  places: listings.places.map(({ id, nickname, listingText, landlordMessages }) => ({ id, nickname, listingText, landlordMessages })),
  crossListingFindings: listings.cross_listing_findings,
};

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
- Use the exact supplied place ids and nicknames, in the supplied order.
- Incorporate every cross-listing finding into the affected place's headline, biggest question, trust/verification section, and next actions.
- Haste St #27 must use the action lane "Pause — do not pay yet" because its deposit and move-in block names studio #7, not unit #27.
- Treat both Haste listings' good-credit requirement as a critical qualification mismatch for this student, who has no U.S. credit, SSN, or U.S. guarantor. Do not invent an alternative route.
- For Oxford St studio, keep the unpublished deposit, application fee, move-in total, lease term, dates, and qualification rules unknown. Its move-in total is uncomputable.
- Put the listing's stated move-in total in financials.publishedMoveIn: $3,800 confirmed for Haste #15, $3,700 unknown for Haste #27 because the block names studio #7, and null/unknown for Oxford.
- financials.fees must contain only actual fees paid in addition to rent or deposit. Never put a published move-in total in the fees array.
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
const expectedIds = ["haste-15", "haste-27", "oxford-2150"];
if (JSON.stringify(analysis.places.map((place) => place.id)) !== JSON.stringify(expectedIds)) throw new Error("GPT-5.6 returned unexpected place ids");
if (analysis.places[1].actionLane !== "Pause — do not pay yet") throw new Error("Haste St #27 must use the pause lane");
if (analysis.places[0].financials.monthlyRent.amount !== 1900 || analysis.places[1].financials.monthlyRent.amount !== 1850 || analysis.places[2].financials.monthlyRent.amount !== 1750) throw new Error("GPT-5.6 returned unexpected rent amounts");
if (analysis.places[0].financials.publishedMoveIn.amount !== 3800 || analysis.places[1].financials.publishedMoveIn.amount !== 3700 || analysis.places[2].financials.publishedMoveIn.amount !== null) throw new Error("GPT-5.6 returned unexpected move-in amounts");
await mkdir(path.join(root, "fixtures"), { recursive: true });
await writeFile(path.join(root, "data/sample-input.json"), `${JSON.stringify(sample, null, 2)}\n`);
await writeFile(path.join(root, "fixtures/analysis.json"), `${JSON.stringify(analysis, null, 2)}\n`);
console.log(`Saved GPT-5.6 fixture with ${analysis.places.length} places.`);
