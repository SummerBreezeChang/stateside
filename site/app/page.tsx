"use client";
/* eslint-disable @next/next/no-img-element -- evidence galleries need direct load-failure handling for archived listing assets */

import { useEffect, useMemo, useState } from "react";
import fixture from "../fixtures/analysis.json";
import marketFixture from "../fixtures/markets.json";
import mediaFixture from "../fixtures/media.json";
import sample from "../data/sample-input.json";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Icon, IconName } from "../components/ui/icon";
import {
  Analysis,
  Evidence,
  PlaceAnalysis,
  computeLeaseFit,
  computeMonthlyTotal,
  computeMoveInCash,
  evidenceForCosts,
  formatMoney,
  validateAnalysis,
} from "../lib/analysis";

type Screen = "landing" | "setup" | "loading" | "compare" | "detail" | "error" | "malformed";
type Priority = "essential" | "important" | "flexible";

const analysis = fixture as Analysis;
const priorities = [
  ["restAndPrivacy", "Rest & privacy"],
  ["affordability", "Affordability"],
  ["simpleCampusTrip", "Simple campus trip"],
  ["programAlignedLease", "Lease matches my stay"],
] as const;

const sectionNames: [keyof PlaceAnalysis["sections"], string, IconName][] = [
  ["restPrivacy", "Rest & privacy", "rest"],
  ["dailyLife", "Daily life & access", "transit"],
  ["totalCommitment", "Total commitment", "fees"],
  ["rentalReadiness", "Rental readiness", "qualification"],
  ["trustVerification", "Trust & verification", "verification"],
];

type MediaPlace = (typeof mediaFixture.places)[number];

function EvidenceBadge({ evidence }: { evidence: Evidence }) {
  return <Badge tone={evidence}>{evidence[0].toUpperCase() + evidence.slice(1)}</Badge>;
}

function ClaimCell({ value, evidence, note }: { value: string; evidence: Evidence; note?: string }) {
  return (
    <div className="min-w-[210px] space-y-2">
      <p className="font-medium leading-6 text-stone-900">{value}</p>
      <EvidenceBadge evidence={evidence} />
      {note ? <p className="text-sm leading-5 text-stone-500">{note}</p> : null}
    </div>
  );
}

function FavoriteButton({ placeId, saved, onToggle }: { placeId: string; saved: boolean; onToggle: (placeId: string) => void }) {
  return <button type="button" onClick={() => onToggle(placeId)} aria-pressed={saved} className={`rounded-md border px-3 py-2 text-sm font-semibold ${saved ? "border-rose-200 bg-rose-50 text-rose-800" : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"}`}><span aria-hidden="true">{saved ? "♥" : "♡"}</span> {saved ? "Saved" : "Save"}</button>;
}

function PhotoEvidence({ media, full = false }: { media: MediaPlace; full?: boolean }) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<number[]>([]);
  const [lightbox, setLightbox] = useState(false);
  const limited = media.photoCount < 8;
  const shared = media.shared.includes(active);
  const imageFailed = failed.includes(active);
  return <div>
    <button type="button" onClick={() => !imageFailed && setLightbox(true)} className={`relative block aspect-[4/3] w-full overflow-hidden bg-stone-200 ${imageFailed ? "cursor-default" : "cursor-zoom-in"}`} aria-label={`Open ${media.nickname} photo ${active + 1}`}>
      {imageFailed ? <span className="grid h-full place-items-center text-sm font-semibold text-stone-500">Image unavailable</span> : <img src={media.images[active]} alt={`${media.nickname} listing photo ${active + 1}`} loading={full ? "eager" : "lazy"} className="h-full w-full object-cover" onError={() => setFailed((items) => [...new Set([...items, active])])} />}
      <span className="absolute bottom-3 right-3 rounded bg-stone-950/80 px-2 py-1 text-xs font-semibold text-white">{active + 1} / {media.photoCount}</span>
      {shared ? <span className="absolute left-3 top-3 max-w-[75%] rounded bg-amber-100 px-2 py-1 text-left text-xs font-semibold text-amber-950">Also used in {media.sharedWith}</span> : null}
    </button>
    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{media.images.slice(0, full ? media.images.length : 5).map((src, index) => <button type="button" key={src} onClick={() => setActive(index)} aria-label={`Show photo ${index + 1}`} className={`relative h-12 w-16 shrink-0 overflow-hidden rounded border-2 bg-stone-200 ${active === index ? "border-teal-800" : "border-transparent"}`}>{failed.includes(index) ? <span className="grid h-full place-items-center text-[9px] text-stone-500">Unavailable</span> : <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" onError={() => setFailed((items) => [...new Set([...items, index])])} />}{media.shared.includes(index) ? <span className="absolute right-0 top-0 h-2 w-2 bg-amber-500" aria-hidden="true" /> : null}</button>)}</div>
    <div className={`mt-3 rounded-md border p-3 ${limited ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}><p className={`text-sm font-semibold ${limited ? "text-amber-950" : "text-emerald-900"}`}>{media.photoCount} photos · {limited ? "Limited visual evidence" : "Substantial visual evidence"}{media.shared.length ? ` · ${media.shared.length} reused` : ""}</p></div>
    <p className="mt-2 text-xs leading-5 text-stone-500">{mediaFixture.alwaysAppend}</p>
    {lightbox ? <div role="dialog" aria-modal="true" aria-label={`${media.nickname} photo viewer`} className="fixed inset-0 z-50 grid place-items-center bg-stone-950/90 p-4"><button type="button" onClick={() => setLightbox(false)} className="absolute right-5 top-5 rounded bg-white px-4 py-2 text-sm font-semibold text-stone-900">Close</button><img src={media.images[active]} alt={`${media.nickname} enlarged listing photo ${active + 1}`} className="max-h-[82vh] max-w-[92vw] object-contain" /></div> : null}
  </div>;
}

function LandingScreen({ onStart, savedCount }: { onStart: () => void; savedCount: number }) {
  return <><AppHeader screen="landing" /><main>
    <section className="border-b border-stone-200 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div><Badge tone="sample">For international students</Badge><h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Understand a U.S. rental before you commit.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-teal-50">Compare qualification, true cost, lease fit, rest, location, and missing evidence across places you already found.</p><div className="mt-8 flex flex-wrap items-center gap-3"><Button variant="secondary" size="lg" onClick={onStart}>Explore the Berkeley comparison →</Button><span className="text-sm text-teal-100">No account or payment required</span></div></div>
        <Card className="overflow-hidden border-white/20 bg-white text-stone-900"><PhotoEvidence media={mediaFixture.places[2]} full /><div className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-teal-900">Why visual evidence matters</p><h2 className="mt-2 text-xl font-semibold">The cheapest, closest listing has the fewest photos.</h2><p className="mt-3 text-sm leading-6 text-stone-600">Stateside makes that uncertainty visible instead of filling the gap with reassuring stock imagery.</p></div></Card>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8"><div className="grid gap-4 md:grid-cols-3">{[["qualification", "Can I qualify?", "Check the route before paying an application fee."], ["cash", "What will I really pay?", "Normalize rent, recurring costs, fees, and move-in cash."], ["verification", "What must I verify?", "Keep unknowns visible and turn them into next questions."]].map(([icon, title, copy]) => <Card className="p-6" key={title}><span className="grid h-10 w-10 place-items-center rounded-md bg-teal-50 text-teal-900"><Icon name={icon as IconName} /></span><h2 className="mt-5 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p></Card>)}</div><Card className="mt-6 flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center"><div><p className="font-semibold">Continue without an account</p><p className="mt-1 text-sm text-stone-600">Save favorites privately in this browser. Real account sync is a post-demo feature.</p></div><Badge tone={savedCount ? "confirmed" : "unknown"}>{savedCount} saved {savedCount === 1 ? "place" : "places"}</Badge></Card></section>
  </main></>;
}

function AppHeader({ screen }: { screen: Screen }) {
  const step = screen === "landing" || screen === "setup" ? 1 : screen === "compare" || screen === "loading" ? 2 : 3;
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-teal-900 font-semibold text-white">S</div>
          <div><p className="font-semibold tracking-tight">Stateside</p><p className="text-xs text-stone-500">Understand before you commit</p></div>
        </div>
        <div className={`${screen === "landing" ? "hidden" : "hidden sm:flex"} items-center gap-2 text-sm`} aria-label={`Step ${step} of 3`}>
          {["Setup", "Compare", "Decision plan"].map((label, index) => (
            <div className="flex items-center gap-2" key={label}>
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${step >= index + 1 ? "bg-teal-900 text-white" : "bg-stone-100 text-stone-500"}`}>{index + 1}</span>
              <span className={step === index + 1 ? "font-semibold text-stone-900" : "text-stone-500"}>{label}</span>
              {index < 2 ? <span className="mx-1 text-stone-300">/</span> : null}
            </div>
          ))}
        </div>
        <Badge tone="sample">Research-backed demo</Badge>
      </div>
    </header>
  );
}

function SetupScreen({ onCompare }: { onCompare: () => void }) {
  const [levels, setLevels] = useState<Record<string, Priority>>(sample.student.priorities as Record<string, Priority>);
  const [listingText, setListingText] = useState(sample.places.map((place) => `${place.listingText}\n\nLandlord message / lease excerpt:\n${place.landlordMessages}`));
  const [selectedMarket, setSelectedMarket] = useState("berkeley");
  const market = marketFixture.markets.find((item) => item.id === selectedMarket) ?? marketFixture.markets[0];

  return (
    <>
      <AppHeader screen="setup" />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-teal-900">Your shortlist, in one clear view</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">Compare the places you already found.</h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">Stateside normalizes three rentals around your stay, your qualification route, and what is still unclear—before you apply or pay.</p>
        </div>

        <section className="mb-8" aria-labelledby="campus-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-teal-900">Bay Area campus context</p><h2 id="campus-heading" className="mt-1 text-xl font-semibold">Choose a campus market</h2></div><p className="text-xs text-stone-500">Collected {marketFixture.collectedAt}</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {marketFixture.markets.map((item) => <button type="button" key={item.id} onClick={() => setSelectedMarket(item.id)} aria-pressed={selectedMarket === item.id} className={`rounded-lg border p-4 text-left transition ${selectedMarket === item.id ? "border-teal-900 bg-teal-50 ring-1 ring-teal-900" : "border-stone-200 bg-white hover:border-stone-400"}`}><div className="flex items-start justify-between gap-3"><Icon name="location" className={selectedMarket === item.id ? "text-teal-900" : "text-stone-400"} /><Badge tone={item.id === "sfstate" ? "unknown" : "sample"}>{item.status}</Badge></div><p className="mt-4 font-semibold">{item.school}</p><p className="text-sm text-stone-500">{item.area}</p></button>)}
          </div>
          <Card className="mt-3 grid gap-4 p-5 sm:grid-cols-[180px_1fr] sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Observed range</p><p className="mt-1 text-2xl font-semibold text-teal-950">{market.observedRange ?? "Not yet collected"}</p></div><div><p className="text-sm leading-6 text-stone-700">{market.summary}</p><p className="mt-2 text-xs text-stone-500">Source: {market.source}</p></div></Card>
        </section>

        <Card className="mb-8 p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-sm font-semibold text-teal-900">Demo student profile</p><h2 className="mt-1 text-xl font-semibold">Incoming UC Berkeley graduate student</h2></div>
            <p className="max-w-xl text-sm leading-6 text-stone-600">9-month program · Arrives Aug 12 · No car · No U.S. credit · No SSN · No U.S. guarantor · Parent-funded</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {priorities.map(([id, label]) => (
              <div className="rounded-lg border border-stone-200 p-4" key={id}>
                <p className="mb-3 font-medium">{label}</p>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label={`${label} priority`}>
                  {(["essential", "important", "flexible"] as Priority[]).map((level) => (
                    <button key={level} type="button" onClick={() => setLevels((current) => ({ ...current, [id]: level }))} className={`rounded-md border px-2 py-2 text-xs font-semibold capitalize transition ${levels[id] === level ? "border-teal-900 bg-teal-50 text-teal-950" : "border-stone-200 bg-white text-stone-500 hover:border-stone-400"}`} aria-pressed={levels[id] === level}>{level}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="text-sm font-semibold text-teal-900">Three-place decision packet</p><h2 className="mt-1 text-2xl font-semibold">Review the listing and landlord evidence</h2></div>
          <p className="hidden text-sm text-stone-500 sm:block">Editable for exploration</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {sample.places.map((place, index) => (
            <Card className="flex flex-col p-5" key={place.id}>
              <div className="mb-4 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-md bg-teal-50 text-sm font-semibold text-teal-900">{String.fromCharCode(65 + index)}</span><h3 className="font-semibold">{place.nickname}</h3></div>
              <Textarea value={listingText[index]} onChange={(event) => setListingText((current) => current.map((text, textIndex) => textIndex === index ? event.target.value : text))} aria-label={`${place.nickname} listing and messages`} className="min-h-80 flex-1" />
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-end gap-3">
          <Button onClick={onCompare} size="lg" disabled={selectedMarket !== "berkeley"}>{selectedMarket === "berkeley" ? "Compare my places" : "Berkeley is the full demo"} <span aria-hidden="true">→</span></Button>
          <p className="max-w-2xl text-right text-xs leading-5 text-stone-500">{selectedMarket === "berkeley" ? "Research-backed prototype: public market and visual evidence are dated and sourced; the student profile and lease/qualification excerpts are safe demo inputs analyzed by GPT‑5.6." : "This market currently provides context only. Select UC Berkeley for the full three-place comparison."}</p>
        </div>
      </main>
    </>
  );
}

function LoadingScreen() {
  return (
    <><AppHeader screen="loading" /><main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5 text-center"><div role="status"><div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-900" /><h1 className="text-2xl font-semibold">Normalizing the three places</h1><p className="mt-3 text-stone-600">Separating confirmed details, reasonable interpretations, and questions that still need answers.</p></div></main></>
  );
}

function StateScreen({ malformed, onReset }: { malformed?: boolean; onReset: () => void }) {
  return (
    <><AppHeader screen="compare" /><main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 text-center"><Card className="p-8"><Badge tone="unknown">Needs attention</Badge><h1 className="mt-5 text-2xl font-semibold">{malformed ? "The analysis was incomplete" : "We couldn’t compare the places"}</h1><p className="mt-3 leading-7 text-stone-600">{malformed ? "One or more required evidence fields were missing. Your listing text is still here; no payment or application was made." : "The analysis service did not respond. The sample comparison remains available, and you can try again without re-entering your information."}</p><Button className="mt-6" onClick={onReset}>Return to setup</Button></Card></main></>
  );
}

function CompareScreen({ onBack, onOpen, favorites, onToggleFavorite }: { onBack: () => void; onOpen: (index: number) => void; favorites: string[]; onToggleFavorite: (placeId: string) => void }) {
  const rows = useMemo(() => [
    { label: "Headline status", icon: "status" as IconName, cells: analysis.places.map((place) => ({ value: place.headline.value, evidence: place.headline.evidence, note: place.headline.whyItMatters })) },
    { label: "Can I qualify?", icon: "qualification" as IconName, emphasis: true, cells: analysis.places.map((place) => ({ value: place.qualification.summary.value, evidence: place.qualification.summary.evidence, note: place.qualification.route })) },
    { label: "Monthly rent", icon: "rent" as IconName, cells: analysis.places.map((place) => ({ value: formatMoney(place.financials.monthlyRent.amount), evidence: place.financials.monthlyRent.evidence, note: place.financials.monthlyRent.note })) },
    { label: "Utilities & recurring", icon: "recurring" as IconName, cells: analysis.places.map((place) => { const total = computeMonthlyTotal(place); const recurring = place.financials.recurring.map((item) => `${item.label}: ${formatMoney(item.amount)}`).join(" · "); return { value: total.label, evidence: total.evidence, note: recurring }; }) },
    { label: "Fees", icon: "fees" as IconName, emphasis: true, cells: analysis.places.map((place) => ({ value: place.financials.fees.map((fee) => `${fee.label} ${formatMoney(fee.amount)}`).join(" · ") || "None stated", evidence: evidenceForCosts(place.financials.fees), note: place.financials.fees.map((fee) => fee.note).join(" ") })) },
    { label: "Move-in cash total", icon: "cash" as IconName, cells: analysis.places.map((place) => { const total = computeMoveInCash(place); return { value: total.label, evidence: total.evidence, note: "Calculated in Stateside from stated rent, deposit, and non-credited fees." }; }) },
    { label: "Lease vs program dates", icon: "calendar" as IconName, cells: analysis.places.map((place) => ({ value: computeLeaseFit(place.lease.start, place.lease.end, sample.student.programStart, sample.student.programEnd), evidence: place.lease.summary.evidence, note: place.lease.summary.whyItMatters })) },
    { label: "Rest & privacy", icon: "rest" as IconName, cells: analysis.places.map((place) => ({ value: place.restPrivacy.value, evidence: place.restPrivacy.evidence, note: place.restPrivacy.whyItMatters })) },
    { label: "Campus + evening return", icon: "transit" as IconName, cells: analysis.places.map((place) => ({ value: place.campusEvening.value, evidence: place.campusEvening.evidence, note: place.campusEvening.whyItMatters })) },
    { label: "Visual evidence", icon: "camera" as IconName, emphasis: true, cells: analysis.places.map((place) => { const media = mediaFixture.places.find((item) => item.id === place.id)!; return { value: `${media.photoCount} photos${media.shared.length ? ` · ${media.shared.length} reused` : ""}`, evidence: (media.photoCount >= 8 ? "confirmed" : "inferred") as Evidence, note: media.photoCount >= 8 ? "Substantial listing-photo coverage; exact-unit coverage still needs confirmation." : "Limited listing-photo coverage. Request a live tour of the exact unit." }; }) },
    { label: "Biggest unresolved question", icon: "question" as IconName, cells: analysis.places.map((place) => ({ value: place.biggestQuestion.value, evidence: place.biggestQuestion.evidence, note: place.biggestQuestion.whyItMatters })) },
  ], []);

  return (
    <><AppHeader screen="compare" /><main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><button type="button" onClick={onBack} className="mb-5 text-sm font-semibold text-teal-900 hover:underline">← Edit shortlist</button><p className="text-sm font-semibold text-teal-900">Research-backed decision demo</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">The same questions, for every place.</h1><p className="mt-3 max-w-2xl leading-7 text-stone-600">Qualification comes first. Unknown information stays visible instead of being treated as a favorable answer.</p></div><div className="flex flex-wrap gap-2"><EvidenceBadge evidence="confirmed" /><EvidenceBadge evidence="inferred" /><EvidenceBadge evidence="unknown" /></div></div>
      <section className="mb-6 rounded-lg bg-teal-950 p-5 text-white sm:p-6" aria-labelledby="decision-order-heading"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Three-second decision order</p><h2 id="decision-order-heading" className="mt-2 text-xl font-semibold">Can I qualify? → What will I really pay? → Does the commitment fit? → What remains unknown?</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["qualification", "1", "Qualification", "The only binary filter"], ["cash", "2", "True cost", "Monthly + move-in"], ["calendar", "3", "Commitment", "Lease vs program"], ["question", "4", "Unknowns", "Questions before payment"]].map(([icon, number, label, description]) => <div className="flex items-center gap-3 rounded-md bg-white/10 p-3" key={label}><Icon name={icon as IconName} className="text-teal-100" /><div><p className="text-xs text-teal-200">{number}. {label}</p><p className="text-sm font-semibold">{description}</p></div></div>)}</div></section>
      <section className="mb-6 grid gap-3 lg:grid-cols-3" aria-label="At-a-glance decision signals">{analysis.places.map((place, index) => { const monthly = computeMonthlyTotal(place); return <Card className="overflow-hidden" key={place.id}><div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4"><p className="font-semibold">{String.fromCharCode(65 + index)}. {place.nickname}</p><div className="flex items-center gap-2"><FavoriteButton placeId={place.id} saved={favorites.includes(place.id)} onToggle={onToggleFavorite} /><button onClick={() => onOpen(index)} className="text-sm font-semibold text-teal-900 hover:underline" type="button">Open →</button></div></div><div className="grid grid-cols-2 divide-x divide-stone-200"><div className="p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="qualification" className="h-4 w-4" />Qualification</div><p className="mt-2 text-sm font-semibold leading-5">{place.actionLane}</p></div><div className="p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="cash" className="h-4 w-4" />Monthly</div><p className="mt-2 text-lg font-semibold text-teal-950">{monthly.label}</p></div></div></Card>; })}</section>
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead><tr className="border-b border-stone-200 bg-stone-50"><th className="sticky left-0 z-20 w-48 bg-stone-50 p-5 text-sm font-semibold text-stone-600">Compare</th>{analysis.places.map((place, index) => <th className="w-[30%] p-5 align-top" key={place.id}><p className="text-lg font-semibold">{String.fromCharCode(65 + index)}. {place.nickname}</p><button onClick={() => onOpen(index)} className="mt-3 text-sm font-semibold text-teal-900 hover:underline" type="button">Open decision plan →</button></th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr className={`border-b border-stone-200 last:border-0 ${row.emphasis ? "bg-teal-50/50" : ""}`} key={row.label}><th scope="row" className={`sticky left-0 z-10 p-5 align-top text-sm font-semibold ${row.emphasis ? "bg-teal-50 text-teal-950" : "bg-white text-stone-700"}`}><span className="flex items-center gap-2"><Icon name={row.icon} className={row.emphasis ? "text-teal-900" : "text-stone-400"} />{row.label}</span></th>{row.cells.map((cell, index) => <td className="border-l border-stone-200 p-5 align-top" key={`${row.label}-${analysis.places[index].id}`}><ClaimCell {...cell} /></td>)}</tr>)}</tbody>
        </table>
      </div>
      <section className="mt-8" aria-labelledby="visual-evidence-heading"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-teal-900">Visual research layer</p><h2 id="visual-evidence-heading" className="mt-1 text-2xl font-semibold">The gallery is evidence, not decoration.</h2></div><Badge tone="sample">28 public listing photos · {mediaFixture.collectedAt}</Badge></div><div className="grid gap-4 lg:grid-cols-3">{mediaFixture.places.map((media) => <Card className="overflow-hidden" key={media.id}><PhotoEvidence media={media} /><div className="p-5"><p className="font-semibold">{media.nickname}</p><p className="mt-2 text-sm leading-6 text-stone-600">{media.walk.minutes}-minute estimated straight-line walk to campus · {media.walk.distance}. Exact route and evening conditions remain unverified.</p></div></Card>)}</div><p className="mt-3 text-xs leading-5 text-stone-500">Public listing identities, photos, coordinates, and market observations are sourced research. The qualification and lease analysis above uses safe demo excerpts so no private applicant or landlord data is exposed.</p></section>
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-semibold text-amber-900">Hidden clause surfaced</p><p className="mt-2 leading-7 text-amber-950">Fulton’s listing says “utilities included,” but its lease excerpt bills electricity separately and makes each tenant responsible for a co-tenant’s unpaid balances. Stateside keeps that contradiction in the comparison instead of silently choosing the cheaper interpretation.</p></div>
      <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5 sm:p-6" aria-labelledby="market-patterns-heading"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-teal-900">Market patterns</p><h2 id="market-patterns-heading" className="mt-1 text-2xl font-semibold">What appeared across four Bay Area campus searches</h2></div><p className="text-xs text-stone-500">Collected {marketFixture.collectedAt} · Public listing pages</p></div><div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">{marketFixture.patterns.map((pattern) => { const icon: IconName = pattern.id === "duplicates" ? "duplicate" : pattern.id === "two-prices" || pattern.id === "price-mismatch" ? "price" : "stale"; const warning = pattern.tone === "warning"; return <div className={`rounded-lg border p-4 ${warning ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`} key={pattern.id}><Icon name={icon} className={warning ? "text-amber-700" : "text-slate-600"} /><p className="mt-4 font-semibold">{pattern.label}</p><p className="mt-2 text-sm leading-6 text-stone-600">{pattern.finding}</p></div>; })}</div><p className="mt-4 text-sm leading-6 text-stone-600">These are advertisement-quality signals—not conclusions about a property. SF State remains “Not yet collected” because the initial query was too restrictive to support a finding.</p></section>
      <Disclaimer />
    </main></>
  );
}

function DetailScreen({ selected, onSelect, onBack, favorites, onToggleFavorite }: { selected: number; onSelect: (index: number) => void; onBack: () => void; favorites: string[]; onToggleFavorite: (placeId: string) => void }) {
  const place = analysis.places[selected];
  const media = mediaFixture.places.find((item) => item.id === place.id)!;
  const monthly = computeMonthlyTotal(place);
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => { await navigator.clipboard.writeText(`Subject: ${place.draftEmail.subject}\n\n${place.draftEmail.body}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const laneClass = place.actionLane === "Pause — do not pay yet" ? "border-red-200 bg-red-50 text-red-800" : place.actionLane === "Set aside" ? "border-stone-300 bg-stone-100 text-stone-800" : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <><AppHeader screen="detail" /><main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <button type="button" onClick={onBack} className="mb-6 text-sm font-semibold text-teal-900 hover:underline">← Back to comparison</button>
      <div className="mb-8 flex flex-wrap gap-2" aria-label="Choose a place">{analysis.places.map((item, index) => <button key={item.id} type="button" onClick={() => onSelect(index)} aria-pressed={selected === index} className={`rounded-md border px-4 py-2 text-sm font-semibold ${selected === index ? "border-teal-900 bg-teal-900 text-white" : "border-stone-200 bg-white text-stone-600"}`}>{String.fromCharCode(65 + index)}. {item.nickname}</button>)}</div>
      <Card className="overflow-hidden"><div className="grid gap-6 border-b border-stone-200 p-6 sm:p-8 lg:grid-cols-[1fr_auto]"><div><p className="text-sm font-semibold text-teal-900">Decision plan</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{place.nickname}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">{place.headline.value}</p><div className="mt-5"><FavoriteButton placeId={place.id} saved={favorites.includes(place.id)} onToggle={onToggleFavorite} /></div></div><div className="min-w-44 rounded-lg bg-teal-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-teal-900">Normalized monthly</p><p className="mt-2 text-3xl font-semibold text-teal-950">{monthly.label}</p><p className="mt-2 text-xs text-stone-500">Calculated from stated amounts</p></div></div><div className={`border-b p-5 sm:px-8 ${laneClass}`}><p className="text-xs font-semibold uppercase tracking-wide">Action lane</p><p className="mt-1 text-xl font-semibold">{place.actionLane}</p></div></Card>

      <section className="mt-5 grid gap-5 lg:grid-cols-2" aria-label="Visual and location evidence"><Card className="overflow-hidden"><PhotoEvidence media={media} full /><div className="p-5"><p className="font-semibold">Public visual research: {media.nickname}</p><p className="mt-2 text-xs leading-5 text-stone-500">This sourced gallery demonstrates the visual-verification layer. The safe decision packet is not presented as the public listing&apos;s full lease record.</p></div></Card><Card className="overflow-hidden"><iframe title={`Map near ${media.nickname}`} src={media.osmEmbed} loading="lazy" className="aspect-[4/3] w-full border-0" /><div className="p-5"><div className="flex items-start gap-3"><Icon name="location" className="mt-1 text-teal-900" /><div><p className="font-semibold">{media.walk.minutes}-minute estimated walk</p><p className="text-sm text-stone-500">{media.walk.distance} · straight-line estimate, not a routed or confirmed trip</p></div></div><div className="mt-5 flex flex-wrap gap-3"><a href={media.mapLink} target="_blank" rel="noreferrer" className="rounded-md bg-teal-900 px-4 py-2 text-sm font-semibold text-white">Open in Maps ↗</a><a href={media.streetViewLink} target="_blank" rel="noreferrer" className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700">See the street ↗</a></div></div></Card></section>

      <section className="mt-5 grid gap-3 md:grid-cols-3" aria-label="Most important decision signals"><Card className="p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="qualification" className="text-teal-800" />Can I qualify?</div><p className="mt-3 font-semibold leading-6">{place.qualification.summary.value}</p><div className="mt-3"><EvidenceBadge evidence={place.qualification.summary.evidence} /></div></Card><Card className="p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="cash" className="text-teal-800" />True cost</div><p className="mt-3 text-2xl font-semibold text-teal-950">{monthly.label}</p><p className="mt-2 text-sm text-stone-500">Plus {computeMoveInCash(place).label} at move-in</p></Card><Card className="p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="calendar" className="text-teal-800" />Commitment fit</div><p className="mt-3 font-semibold leading-6">{computeLeaseFit(place.lease.start, place.lease.end, sample.student.programStart, sample.student.programEnd)}</p><div className="mt-3"><EvidenceBadge evidence={place.lease.summary.evidence} /></div></Card></section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">{sectionNames.map(([key, name, icon]) => <Card className={key === "trustVerification" ? "p-6 lg:col-span-2" : "p-6"} key={key}><h2 className="flex items-center gap-3 text-xl font-semibold"><span className="grid h-9 w-9 place-items-center rounded-md bg-teal-50 text-teal-900"><Icon name={icon} /></span>{name}</h2><div className="mt-5 space-y-5">{place.sections[key].map((claim, index) => <div className="border-t border-stone-200 pt-4 first:border-0 first:pt-0" key={`${key}-${index}`}><div className="flex flex-wrap items-start justify-between gap-3"><p className="max-w-2xl font-medium leading-6">{claim.value}</p><EvidenceBadge evidence={claim.evidence} /></div><p className="mt-2 text-sm leading-6 text-stone-500"><span className="font-semibold text-stone-700">Why this matters to you:</span> {claim.whyItMatters}</p></div>)}</div></Card>)}</div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3"><Card className="p-6"><p className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Icon name="actions" />Top 3 next actions</p><ol className="mt-5 space-y-4">{place.nextActions.map((action, index) => <li className="flex gap-3" key={index}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-teal-50 text-sm font-semibold text-teal-900">{index + 1}</span><p className="text-sm leading-6">{action.split(/(?<=\.)\s/)[0]}</p></li>)}</ol></Card><Card className="p-6"><p className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Icon name="document" />Document checklist</p><ul className="mt-5 space-y-3">{place.documents.map((document) => <li className="flex gap-3 text-sm leading-6" key={document}><span aria-hidden="true" className="text-teal-800">□</span>{document}</li>)}</ul></Card><Card className="p-6"><p className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Icon name="question" />Ask the landlord</p><ul className="mt-5 space-y-3">{place.landlordQuestions.slice(0, 6).map((question) => <li className="border-t border-stone-200 pt-3 text-sm leading-6 first:border-0 first:pt-0" key={question}>{question}</li>)}</ul></Card></div>

      <Card className="mt-5 p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold text-teal-900">Generated inquiry email</p><h2 className="mt-1 text-xl font-semibold">Ready to review and copy</h2></div><Button variant="secondary" onClick={copyEmail}>{copied ? "Copied" : "Copy email"}</Button></div><div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-5"><p className="font-semibold">Subject: {place.draftEmail.subject}</p><p className="mt-4 whitespace-pre-line text-sm leading-7 text-stone-700">{place.draftEmail.body}</p></div></Card>
      <Disclaimer />
    </main></>
  );
}

function Disclaimer() {
  return <p className="mx-auto mt-10 max-w-4xl border-t border-stone-200 pt-6 text-center text-xs leading-5 text-stone-500">Stateside does not determine whether a home or neighborhood is safe. It helps students review available evidence, understand uncertainties, and prepare appropriate questions before committing.</p>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [selected, setSelected] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("state");
    if (state !== "loading" && state !== "error" && state !== "malformed") return;
    const timer = window.setTimeout(() => setScreen(state), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setFavorites(JSON.parse(window.localStorage.getItem("stateside:favorites") ?? "[]")); }
      catch { setFavorites([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleFavorite = (placeId: string) => setFavorites((current) => {
    const next = current.includes(placeId) ? current.filter((id) => id !== placeId) : [...current, placeId];
    window.localStorage.setItem("stateside:favorites", JSON.stringify(next));
    return next;
  });

  const compare = () => {
    setScreen("loading");
    window.setTimeout(() => {
      try { validateAnalysis(analysis); setScreen("compare"); }
      catch { setScreen("malformed"); }
    }, 700);
  };

  if (screen === "loading") return <LoadingScreen />;
  if (screen === "error" || screen === "malformed") return <StateScreen malformed={screen === "malformed"} onReset={() => setScreen("setup")} />;
  if (screen === "landing") return <LandingScreen onStart={() => setScreen("setup")} savedCount={favorites.length} />;
  if (screen === "compare") return <CompareScreen onBack={() => setScreen("setup")} onOpen={(index) => { setSelected(index); setScreen("detail"); }} favorites={favorites} onToggleFavorite={toggleFavorite} />;
  if (screen === "detail") return <DetailScreen selected={selected} onSelect={setSelected} onBack={() => setScreen("compare")} favorites={favorites} onToggleFavorite={toggleFavorite} />;
  return <SetupScreen onCompare={compare} />;
}
