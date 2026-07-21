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

test("server-renders a clear no-account landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Understand a U\.S\. rental before you commit/);
  assert.match(html, /Explore the Berkeley comparison/);
  assert.match(html, /No account or payment required/);
  assert.match(html, /Can I qualify/);
  assert.match(html, /What will I really pay/);
  assert.match(html, /Continue without an account/);
  assert.match(html, /Research-backed demo/);
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

test("visual hierarchy, favorites, and research context remain evidence-bound", async () => {
  const [source, markets, media] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("fixtures/markets.json", root), "utf8").then(JSON.parse),
    readFile(new URL("fixtures/media.json", root), "utf8").then(JSON.parse),
  ]);
  assert.match(source, /Three-second decision order/);
  assert.match(source, /The gallery is evidence, not decoration/);
  assert.match(source, /Image unavailable/);
  assert.match(source, /stateside:favorites/);
  assert.match(source, /straight-line estimate, not a routed or confirmed trip/);
  assert.equal(markets.collectedAt, "2026-07-21");
  assert.equal(markets.markets.length, 4);
  assert.equal(markets.markets.find((market) => market.id === "sfstate").observedRange, null);
  assert.deepEqual(media.places.map((place) => place.photoCount), [12, 12, 4]);
  assert.deepEqual(media.places.map((place) => place.shared.length), [3, 3, 0]);
  assert.ok(media.places.flatMap((place) => place.images).every((image) => image.startsWith("/listings/") && !image.includes("craigslist.org")));
});

test("public metadata identifies Stateside consistently", async () => {
  const [layout, favicon, manifest] = await Promise.all([
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("public/favicon.svg", root), "utf8"),
    readFile(new URL("public/site.webmanifest", root), "utf8").then(JSON.parse),
  ]);
  assert.match(layout, /metadataBase: new URL\("https:\/\/stateside-student-housing\.summerchang\.chatgpt\.site"\)/);
  assert.match(layout, /international student housing/);
  assert.match(layout, /summary_large_image/);
  assert.match(favicon, /#134E4A/);
  assert.equal(manifest.short_name, "Stateside");
});
