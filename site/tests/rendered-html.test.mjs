import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the one-click sample setup", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Stateside — Compare your U\.S\. housing shortlist/);
  assert.match(html, /Compare my places/);
  assert.match(html, /Incoming UC Berkeley graduate student/);
  assert.match(html, /No U\.S\. credit/);
  assert.match(html, /Shattuck studio/);
  assert.match(html, /Fulton private room/);
  assert.match(html, /Albany studio/);
  assert.match(html, /Sample data/);
  assert.match(html, /<textarea/);
});

test("fixture preserves the GPT-5.6 analysis contract", async () => {
  const fixture = JSON.parse(await readFile(new URL("fixtures/analysis.json", root), "utf8"));
  assert.deepEqual(fixture.places.map((place) => place.id), ["shattuck", "fulton", "albany"]);
  for (const place of fixture.places) {
    assert.ok(["confirmed", "inferred", "unknown"].includes(place.headline.evidence));
    assert.ok(["confirmed", "inferred", "unknown"].includes(place.qualification.summary.evidence));
    assert.equal(place.nextActions.length, 3);
    assert.ok(place.documents.length >= 1);
    assert.ok(place.landlordQuestions.length >= 1);
    assert.ok(place.draftEmail.subject && place.draftEmail.body);
  }
  const fulton = fixture.places[1];
  assert.match(fulton.financials.recurring[0].note, /listing says utilities are included/i);
  assert.match(fulton.financials.recurring[0].note, /lease excerpt says electricity is billed separately/i);
});

test("comparison source keeps the required fixed row order", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  const labels = ["Headline status", "Can I qualify?", "Monthly rent", "Utilities & recurring", "Fees", "Move-in cash total", "Lease vs program dates", "Rest & privacy", "Campus + evening return", "Biggest unresolved question"];
  let previous = -1;
  for (const label of labels) {
    const index = source.indexOf(`label: "${label}"`);
    assert.ok(index > previous, `${label} must follow the previous comparison row`);
    previous = index;
  }
  assert.doesNotMatch(source, /winner badge|total score/i);
  assert.match(source, /computeMonthlyTotal/);
  assert.match(source, /computeMoveInCash/);
  assert.match(source, /computeLeaseFit/);
});

test("required states and disclaimer are present", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.match(source, /Normalizing the three places/);
  assert.match(source, /We couldn’t compare the places/);
  assert.match(source, /The analysis was incomplete/);
  assert.match(source, /Stateside does not determine whether a home or neighborhood is safe/);
  assert.match(source, /Pause — do not pay yet/);
});
