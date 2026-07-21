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
  assert.match(html, /Compare rentals before you apply or pay/);
  assert.match(html, /Bring rent, application requirements/);
  assert.equal(html.match(/Start comparing/g)?.length, 5);
  assert.doesNotMatch(html, /See the three steps|Start the Berkeley demo/);
  assert.match(html, /No account, payment, or personal documents required/);
  assert.match(html, /How it works/);
  assert.match(html, /Tell us what you need/);
  assert.match(html, /Add up to three places/);
  assert.match(html, /Review and verify/);
  assert.match(html, /Can I apply/);
  assert.match(html, /What will it cost/);
  assert.doesNotMatch(html, /Berkeley demo/);
  assert.doesNotMatch(html, /Where to search/);
  assert.doesNotMatch(html, /href="#how-it-works"|href="#what-you-get"/);
  assert.doesNotMatch(html, /AI housing decision companion/i);
});

test("fixture preserves the GPT-5.6 analysis contract", async () => {
  const [fixture, listings, media, markets] = await Promise.all([
    readFile(new URL("fixtures/analysis.json", root), "utf8").then(JSON.parse),
    readFile(new URL("fixtures/listings.json", root), "utf8").then(JSON.parse),
    readFile(new URL("fixtures/media.json", root), "utf8").then(JSON.parse),
    readFile(new URL("fixtures/markets.json", root), "utf8").then(JSON.parse),
  ]);
  const ids = ["haste-15", "haste-27", "oxford-2150"];
  assert.deepEqual(fixture.places.map((place) => place.id), ids);
  assert.deepEqual(listings.places.map((place) => place.id), ids);
  assert.deepEqual(media.places.map((place) => place.id), ids);
  assert.deepEqual(markets.markets.find((market) => market.id === "berkeley").listingIds, ids);
  assert.deepEqual(fixture.places.map((place) => place.nickname), ["Haste St #15", "Haste St #27", "Oxford St studio"]);
  assert.deepEqual(fixture.places.map((place) => place.financials.monthlyRent.amount), [1900, 1850, 1750]);
  assert.deepEqual(fixture.places.map((place) => place.financials.publishedMoveIn.amount), [3800, 3700, null]);
  assert.deepEqual(fixture.places.map((place) => place.lease.termMonths), [12, 12, null]);
  for (const place of fixture.places) {
    assert.ok(["confirmed", "inferred", "unknown"].includes(place.headline.evidence));
    assert.ok(["confirmed", "inferred", "unknown"].includes(place.qualification.summary.evidence));
    assert.equal(place.nextActions.length, 3);
    assert.ok(place.documents.length >= 1);
    assert.ok(place.landlordQuestions.length >= 1);
    assert.ok(place.draftEmail.subject && place.draftEmail.body);
  }
  const [haste15, haste27, oxford] = fixture.places;
  assert.equal(haste27.actionLane, "Pause — do not pay yet");
  assert.match(haste27.financials.publishedMoveIn.note, /studio #7.*unit #27/i);
  assert.match(oxford.financials.publishedMoveIn.note, /uncomputable/i);
  for (const haste of [haste15, haste27]) {
    const qualificationText = `${haste.qualification.summary.value} ${haste.qualification.summary.whyItMatters} ${haste.qualification.route}`;
    assert.match(haste.qualification.summary.value, /good credit/i);
    assert.match(qualificationText, /no U\.S\. credit/i);
    assert.match(qualificationText, /SSN/i);
    assert.match(qualificationText, /U\.S\. guarantor/i);
    assert.match(haste.qualification.summary.value, /critical(?: qualification)? mismatch/i);
  }
  assert.deepEqual(listings.cross_listing_findings.map((finding) => finding.id), ["wrong-unit-reference", "shared-photos", "missing-commitment-terms"]);
});

test("comparison source keeps the required fixed row order", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  const labels = ["Headline status", "Can I qualify?", "Monthly rent", "Utilities & recurring", "Fees", "Move-in cash total", "Lease vs program dates", "Rest & privacy", "Campus + evening return", "Visual evidence", "Listing checks", "Biggest unresolved question"];
  let previous = -1;
  for (const label of labels) {
    const index = source.indexOf(`label: "${label}"`);
    assert.ok(index > previous, `${label} must follow the previous comparison row`);
    previous = index;
  }
  assert.doesNotMatch(source, /winner badge|total score/i);
  assert.match(source, /computeMonthlyTotal/);
  assert.match(await readFile(new URL("lib/analysis.ts", root), "utf8"), /!\/optional\/i\.test\(item\.label\)/);
  assert.match(source, /computeMoveInCash/);
  assert.match(source, /computeLeaseFit/);
  assert.match(source, /listingFixture\.cross_listing_findings/);
  assert.match(source, /Pause before payment/);
  assert.match(source, /Critical · pause/);
  assert.match(source, /computeLeaseFit\(place, sample\.student\.programMonths/);
  assert.match(source, /Listing checks/);
});

test("required states and disclaimer are present", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.match(source, /Preparing your comparison/);
  assert.match(source, /The comparison didn’t load/);
  assert.match(source, /We couldn’t finish this comparison/);
  assert.match(source, /Stateside does not rate safety or guarantee approval/);
  assert.match(source, /Pause — do not pay yet/);
  assert.match(source, /screen !== "landing" && screen !== "setup"/);
  assert.doesNotMatch(source, /Step 1 · Your needs/);
  assert.doesNotMatch(source, /aria-label="Setup sections"/);
  assert.match(source, /UC Berkeley Master of Engineering/);
  assert.match(source, /Question \{question \+ 1\} of 3/);
  assert.match(source, /How long do you need housing/);
  assert.match(source, /Priorities used in this comparison/);
  assert.match(source, /Select one to three researched places/);
  assert.match(source, /Add this place/);
  assert.match(source, /Remove/);
  assert.match(source, /Researched Berkeley sample:/);
  assert.match(source, /View the researched comparison/);
  assert.match(source, /Pasting arbitrary links is not enabled in this demo/);
  assert.match(source, /View full comparison/);
  assert.match(source, /Best current fit to verify/);
  assert.match(source, /Open \$\{place\.nickname\} decision plan/);
  assert.match(source, /aria-hidden="true" tabIndex=\{-1\}/);
  assert.doesNotMatch(source, /action\.split/);
  assert.doesNotMatch(source, /Show my comparison/);
});

test("visual hierarchy, favorites, and research context remain evidence-bound", async () => {
  const [source, markets, media, searchDirectory] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("fixtures/markets.json", root), "utf8").then(JSON.parse),
    readFile(new URL("fixtures/media.json", root), "utf8").then(JSON.parse),
    readFile(new URL("fixtures/where-to-search.json", root), "utf8").then(JSON.parse),
  ]);
  assert.match(source, /Review in this order/);
  assert.match(source, /Start with the rooms/);
  assert.match(source, /See what each listing actually shows/);
  assert.ok(source.indexOf('id="photos"') < source.indexOf('id="summary"'));
  assert.match(source, /Image unavailable/);
  assert.match(source, /Source: Craigslist post/);
  assert.match(source, /original URL unavailable/);
  assert.match(source, /stateside:favorites/);
  assert.match(source, /straight-line estimate, not a confirmed route/);
  assert.equal(markets.collectedAt, "2026-07-21");
  assert.equal(markets.markets.length, 4);
  assert.equal(markets.markets.find((market) => market.id === "sfstate").observedRange, null);
  assert.deepEqual(media.places.map((place) => place.photoCount), [12, 12, 4]);
  assert.deepEqual(media.places.map((place) => place.shared.length), [3, 3, 0]);
  assert.ok(media.places.flatMap((place) => place.images).every((image) => image.startsWith("/listings/") && !image.includes("craigslist.org")));
  assert.equal(searchDirectory.campuses[0].id, "uc-berkeley");
  assert.equal(searchDirectory._meta.honesty, "Stateside is not affiliated with any site listed. No paid placement.");
  assert.ok(searchDirectory.campuses[0].start_here.why && searchDirectory.campuses[0].start_here.watch_for);
  assert.ok(searchDirectory.campuses[0].also_try.every((item) => item.url.startsWith("https://") && item.why && item.watch_for));
  assert.ok(searchDirectory.campuses[0].for_international_students.resources.every((item) => item.url.startsWith("https://") && item.what));
  assert.match(source, /Where to start looking/);
  assert.match(source, /Common routes, not endorsements/);
  assert.match(source, /rel="noopener noreferrer"/);
  assert.doesNotMatch(source, /Search rentals|type="search"/);
});

test("public metadata and visual identity identify Stateside consistently", async () => {
  const [layout, page, styles, favicon, hero, manifest] = await Promise.all([
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("public/favicon.svg", root), "utf8"),
    readFile(new URL("public/stateside-flow-v3.jpg", root)),
    readFile(new URL("public/site.webmanifest", root), "utf8").then(JSON.parse),
  ]);
  assert.match(layout, /metadataBase: new URL\("https:\/\/stateside-student-housing\.summerchang\.chatgpt\.site"\)/);
  assert.match(layout, /international student housing/);
  assert.match(layout, /summary_large_image/);
  assert.match(layout, /stateside-flow-v3\.jpg/);
  assert.match(page, /stateside-flow-v3\.jpg/);
  assert.match(page, /Start with three places\. Leave with clear next steps/);
  assert.match(page, /saved.*on this device/);
  assert.match(page, /window\.location\.href = "\/"/);
  assert.match(page, /You are here: Step/);
  assert.match(page, /On this page/);
  assert.match(styles, /\.motion-ready \.motion-reveal/);
  assert.match(styles, /translate3d\(-20px, 16px, 0\)/);
  assert.match(page, /IntersectionObserver/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(layout, /Unbounded/);
  assert.match(layout, /"900"/);
  assert.match(page, /font-black/);
  assert.match(page, /sm:text-3xl/);
  assert.match(page, /grid-cols-\[1fr_auto_1fr\]/);
  assert.match(page, /\[font-family:var\(--font-unbounded\)\]/);
  assert.doesNotMatch(page, /Understand before you commit/);
  assert.doesNotMatch(page, /AI housing decision companion|normalizing the three places|analysis service|generated inquiry email|visual research layer/i);
  assert.match(favicon, /#134E4A/);
  assert.ok(hero.byteLength > 100_000);
  assert.equal(manifest.short_name, "Stateside");
});

test("motion system is consistent and respects reduced-motion preferences", async () => {
  const [source, styles] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /motion-reveal/);
  assert.match(source, /\[screen\]/);
  assert.match(styles, /\.motion-ready \.motion-reveal/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /opacity: 1 !important; transform: none !important/);
});
