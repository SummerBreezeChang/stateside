"use client";
/* eslint-disable @next/next/no-img-element -- evidence galleries need direct load-failure handling for archived listing assets */

import { useEffect, useMemo, useState } from "react";
import fixture from "../fixtures/analysis.json";
import listingFixture from "../fixtures/listings.json";
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

function ClaimCell({ value, evidence, note, attention }: { value: string; evidence: Evidence; note?: string; attention?: "pause" | "warning" }) {
  return (
    <div className={`min-w-[210px] space-y-2 rounded-md ${attention === "pause" ? "border border-red-200 bg-red-50 p-3" : attention === "warning" ? "border border-amber-200 bg-amber-50 p-3" : ""}`}>
      <p className="font-medium leading-6 text-stone-900">{value}</p>
      {attention ? <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${attention === "pause" ? "border-red-200 bg-red-100 text-red-800" : "border-amber-200 bg-amber-100 text-amber-800"}`}>{attention === "pause" ? "Critical · pause" : "Warning"}</span> : <EvidenceBadge evidence={evidence} />}
      {note ? <p className="text-sm leading-5 text-stone-500">{note}</p> : null}
    </div>
  );
}

function FavoriteButton({ placeId, saved, onToggle }: { placeId: string; saved: boolean; onToggle: (placeId: string) => void }) {
  return <button type="button" onClick={() => onToggle(placeId)} aria-pressed={saved} className={`rounded-md border px-3 py-2 text-sm font-semibold ${saved ? "border-rose-200 bg-rose-50 text-rose-800" : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"}`}><span aria-hidden="true">{saved ? "♥" : "♡"}</span> {saved ? "Saved" : "Save"}</button>;
}

function PhotoEvidence({ media, full = false }: { media: MediaPlace; full?: boolean }) {
  const listing = listingFixture.places.find((place) => place.id === media.id)!;
  const postId = listing.sourcePostId;
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
    <p className="mt-1 text-xs leading-5 text-stone-500">Source: Craigslist post {postId} · collected {listingFixture.collectedAt} · {listing.sourceUrl ? <a className="font-semibold text-teal-900 underline" href={listing.sourceUrl} target="_blank" rel="noreferrer">view original</a> : <>original URL unavailable</>}</p>
    {lightbox ? <div role="dialog" aria-modal="true" aria-label={`${media.nickname} photo viewer`} className="fixed inset-0 z-50 grid place-items-center bg-stone-950/90 p-4"><button type="button" onClick={() => setLightbox(false)} className="absolute right-5 top-5 rounded bg-white px-4 py-2 text-sm font-semibold text-stone-900">Close</button><img src={media.images[active]} alt={`${media.nickname} enlarged listing photo ${active + 1}`} className="max-h-[82vh] max-w-[92vw] object-contain" /></div> : null}
  </div>;
}

function StepVisual({ step }: { step: string }) {
  if (step === "1") return <div className="relative aspect-[16/10] overflow-hidden bg-stone-200"><img src={mediaFixture.places[0].images[0]} alt="Public Haste Street listing example" className="h-full w-full object-cover" /><span className="absolute bottom-3 left-3 rounded bg-white/95 px-3 py-1 text-xs font-semibold text-stone-800">Listing + landlord message</span></div>;
  if (step === "2") return <div className="grid aspect-[16/10] grid-cols-2 gap-3 bg-teal-950 p-5">{[["qualification", "Qualification"], ["calendar", "School dates"], ["transit", "Transportation"], ["rest", "Rest priority"]].map(([icon, label]) => <div className="grid place-items-center rounded-lg bg-white/10 text-center text-teal-50" key={label}><div><Icon name={icon as IconName} className="mx-auto" /><p className="mt-2 text-xs font-semibold">{label}</p></div></div>)}</div>;
  return <div className="aspect-[16/10] bg-stone-100 p-5"><div className="h-full rounded-lg border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Same questions · every place</p><div className="mt-4 space-y-3">{[["Can I qualify?", "Confirmed", "bg-emerald-100 text-emerald-800"], ["True monthly cost", "Inferred", "bg-amber-100 text-amber-900"], ["Evening return", "Unknown", "bg-slate-100 text-slate-700"]].map(([label, status, tone]) => <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3 first:border-0 first:pt-0" key={label}><span className="text-sm font-medium">{label}</span><span className={`rounded px-2 py-1 text-[10px] font-semibold ${tone}`}>{status}</span></div>)}</div></div></div>;
}

function LandingScreen({ onStart, savedCount }: { onStart: () => void; savedCount: number }) {
  return <><AppHeader screen="landing" /><main>
    <section className="m-3 overflow-hidden rounded-[1.75rem] bg-cover bg-center text-white sm:m-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(5,47,46,.96) 0%, rgba(5,47,46,.88) 38%, rgba(5,47,46,.28) 72%, rgba(15,23,42,.12) 100%), url('/stateside-flow-v3.jpg')" }}>
      <div className="mx-auto flex min-h-[78vh] max-w-6xl items-center px-5 py-16 sm:px-8 sm:py-24"><div className="hero-arrive max-w-3xl"><Badge tone="sample">For international students renting in the U.S.</Badge><h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">Compare rentals before you apply or pay.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-teal-50">Bring rent, application requirements, lease dates, location, photos, and missing details into one view—so you can see what fits and what to ask next.</p><div className="mt-8"><Button variant="secondary" size="lg" onClick={onStart}>Start comparing</Button></div><p className="mt-4 text-sm text-teal-100">No account, payment, or personal documents required</p></div></div>
    </section>
    <section id="how-it-works" className="reveal-left mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24"><p className="text-sm font-semibold text-teal-900">How it works</p><h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Three steps from shortlist to next steps.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">Use places you already found on a rental site or university portal. Stateside helps you review them before you commit.</p><div className="mt-10 grid gap-5 md:grid-cols-3">{[["1", "Tell us what you need", "Add your school dates, application situation, transportation, and housing priorities."], ["2", "Add up to three places", "Paste the listing, landlord message, or lease excerpt for each place."], ["3", "Review and verify", "Compare the same questions, then open a plan showing what to confirm and what to ask."]].map(([number, title, copy]) => <Card className="overflow-hidden" key={title}><StepVisual step={number} /><div className="p-6"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-teal-900 text-sm font-semibold text-white">{number}</span><h3 className="text-xl font-semibold">{title}</h3></div><p className="mt-4 text-sm leading-6 text-stone-600">{copy}</p></div></Card>)}</div></section>
    <section id="what-you-get" className="border-y border-stone-200 bg-white"><div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><p className="text-sm font-semibold text-teal-900">What you get</p><h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">See what fits. Know what to confirm.</h2><p className="mt-5 text-lg leading-8 text-stone-600">Rental sites help you find options. Stateside helps you understand the choice.</p><div className="mt-8 grid gap-3">{[["qualification", "Can I apply?", "See whether the stated requirements match your situation before paying a fee."], ["cash", "What will it cost?", "Compare rent, monthly charges, fees, and move-in cash."], ["verification", "What is still unclear?", "Turn missing details into questions for the landlord."]].map(([icon, title, copy]) => <div className="flex gap-4 rounded-xl border border-stone-200 p-4" key={title}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-teal-50 text-teal-900"><Icon name={icon as IconName} /></span><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-stone-600">{copy}</p></div></div>)}</div></div><div className="grid grid-cols-2 gap-3 rounded-[1.5rem] bg-stone-100 p-3"><img src={mediaFixture.places[0].images[1]} alt="Haste Street listing interior" className="aspect-[4/5] h-full w-full rounded-xl object-cover" /><div className="grid gap-3"><img src={mediaFixture.places[1].images[2]} alt="Second Haste Street listing interior" className="aspect-square w-full rounded-xl object-cover" /><div className="rounded-xl bg-teal-950 p-5 text-white"><Icon name="duplicate" className="text-amber-300" /><p className="mt-4 font-semibold">3 photos appear in two unit listings</p><p className="mt-2 text-xs leading-5 text-teal-100">Stateside flags the overlap so you know to confirm which photos show the unit.</p></div></div></div></div></section>
    <section className="reveal-left mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16"><Card className="overflow-hidden border-teal-200 bg-teal-50 p-7 text-center sm:p-10"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-2xl text-teal-900 shadow-sm" aria-hidden="true">♡</div><p className="mt-5 text-sm font-semibold text-teal-900">Ready when you are</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Start with three places. Leave with clear next steps.</h2><div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2 text-xs font-semibold text-stone-600"><span className="rounded-full bg-white px-3 py-2">Your needs</span><span aria-hidden="true">→</span><span className="rounded-full bg-white px-3 py-2">3 places</span><span aria-hidden="true">→</span><span className="rounded-full bg-white px-3 py-2">Next steps</span></div><div className="mt-7 flex flex-col items-center gap-3"><Button onClick={onStart} size="lg">Start comparing</Button><Badge tone={savedCount ? "confirmed" : "unknown"}>♥ {savedCount} saved {savedCount === 1 ? "place" : "places"} on this device</Badge></div></Card></section>
  </main></>;
}

function AppHeader({ screen }: { screen: Screen }) {
  const step = screen === "landing" || screen === "setup" ? 1 : screen === "compare" || screen === "loading" ? 2 : 3;
  const stepLabels = ["Your needs", "Compare places", "Next steps"];
  const stepInstructions = [
    "Choose priorities, review the three listings, then show your comparison.",
    "Read the summary first. Open one place when you are ready to verify it.",
    "Review photos, tradeoffs, and questions before you apply or pay.",
  ];
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <button type="button" onClick={() => { window.location.href = "/"; }} className="text-xl font-black tracking-[0.035em] text-teal-950 [font-family:var(--font-unbounded)] sm:text-2xl" aria-label="Return to Stateside home">STATESIDE</button>
        {screen === "landing" ? <nav className="hidden items-center gap-5 text-sm font-medium text-stone-600 md:flex" aria-label="Landing page"><a href="#how-it-works" className="hover:text-teal-900">How it works</a><a href="#what-you-get" className="hover:text-teal-900">What you get</a></nav> : <div className="hidden items-center gap-2 text-sm sm:flex" aria-label={`Step ${step} of 3`}>
          {["Your needs", "Compare places", "Next steps"].map((label, index) => (
            <div className="flex items-center gap-2" key={label}>
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${step >= index + 1 ? "bg-teal-900 text-white" : "bg-stone-100 text-stone-500"}`}>{index + 1}</span>
              <span className={step === index + 1 ? "font-semibold text-stone-900" : "text-stone-500"}>{label}</span>
              {index < 2 ? <span className="mx-1 text-stone-300">/</span> : null}
            </div>
          ))}
        </div>}
        <Badge tone="sample">Berkeley demo</Badge>
      </div>
      {screen !== "landing" ? <div className="border-t border-teal-100 bg-teal-50"><div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8"><p><span className="font-semibold text-teal-950">You are here: Step {step} of 3 · {stepLabels[step - 1]}</span><span className="text-stone-600"> — {stepInstructions[step - 1]}</span></p><span className="hidden shrink-0 font-semibold text-teal-900 lg:block">Next: {step < 3 ? stepLabels[step] : "Make your decision"} →</span></div></div> : null}
    </header>
  );
}

function SetupScreen({ onCompare }: { onCompare: () => void }) {
  const [levels, setLevels] = useState<Record<string, Priority>>(sample.student.priorities as Record<string, Priority>);
  const [listingText, setListingText] = useState(sample.places.map((place) => `${place.listingText}\n\nLandlord message / lease excerpt:\n${place.landlordMessages}`));

  return (
    <>
      <AppHeader screen="setup" />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-teal-900">Step 1 · Your needs</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">Set up your housing comparison.</h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">Start with your situation and priorities. Then review the three places you want to compare.</p>
        </div>

        <nav className="sticky top-2 z-30 mb-6 flex items-center gap-2 overflow-x-auto rounded-lg border border-stone-200 bg-white/95 p-2 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur" aria-label="Setup sections"><span className="px-2 text-xs uppercase tracking-wide text-stone-400">On this page</span><a href="#your-situation" className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-teal-50 hover:text-teal-900">1. Your situation</a><a href="#places-to-compare" className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-teal-50 hover:text-teal-900">2. Places to compare</a></nav>

        <Card id="your-situation" className="scroll-mt-24 mb-8 p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-sm font-semibold text-teal-900">1. Your situation</p><h2 className="mt-1 text-xl font-semibold">Incoming UC Berkeley graduate student</h2></div>
            <p className="max-w-2xl text-sm leading-6 text-stone-600">9-month program · Arrives Aug 12 · $2,000 monthly budget · $4,000 move-in maximum · No car · No U.S. credit, SSN, income, or guarantor · Parent-funded · Furnished on arrival is essential</p>
          </div>
          <p className="mb-4 font-semibold">What matters most?</p>
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

        <div id="places-to-compare" className="scroll-mt-24 mb-5 flex items-end justify-between gap-4">
          <div><p className="text-sm font-semibold text-teal-900">2. Places to compare</p><h2 className="mt-1 text-2xl font-semibold">Review the listing details</h2></div>
          <p className="hidden text-sm text-stone-500 sm:block">You can edit any detail</p>
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
          <Button onClick={onCompare} size="lg">Show my comparison <span aria-hidden="true">→</span></Button>
          <p className="max-w-2xl text-right text-xs leading-5 text-stone-500">This demo uses a fictional student profile and public housing research. No application or payment is made.</p>
        </div>
      </main>
    </>
  );
}

function LoadingScreen() {
  return (
    <><AppHeader screen="loading" /><main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5 text-center"><div role="status"><div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-900" /><h1 className="text-2xl font-semibold">Preparing your comparison</h1><p className="mt-3 text-stone-600">Putting the same questions beside each place and keeping missing details visible.</p></div></main></>
  );
}

function StateScreen({ malformed, onReset }: { malformed?: boolean; onReset: () => void }) {
  return (
    <><AppHeader screen="compare" /><main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 text-center"><Card className="p-8"><Badge tone="unknown">Needs attention</Badge><h1 className="mt-5 text-2xl font-semibold">{malformed ? "We couldn’t finish this comparison" : "The comparison didn’t load"}</h1><p className="mt-3 leading-7 text-stone-600">Your listing details are still here. Return to setup and try again; no application or payment was made.</p><Button className="mt-6" onClick={onReset}>Return to setup</Button></Card></main></>
  );
}

function CompareScreen({ onBack, onOpen, favorites, onToggleFavorite }: { onBack: () => void; onOpen: (index: number) => void; favorites: string[]; onToggleFavorite: (placeId: string) => void }) {
  const pauseFinding = listingFixture.cross_listing_findings.find((finding) => finding.id === "wrong-unit-reference")!;
  const rows = useMemo(() => [
    { label: "Headline status", icon: "status" as IconName, cells: analysis.places.map((place) => ({ value: place.headline.value, evidence: place.headline.evidence, note: place.headline.whyItMatters })) },
    { label: "Can I qualify?", icon: "qualification" as IconName, emphasis: true, cells: analysis.places.map((place) => ({ value: place.qualification.summary.value, evidence: place.qualification.summary.evidence, note: place.qualification.route })) },
    { label: "Monthly rent", icon: "rent" as IconName, cells: analysis.places.map((place) => ({ value: formatMoney(place.financials.monthlyRent.amount), evidence: place.financials.monthlyRent.evidence, note: place.financials.monthlyRent.note })) },
    { label: "Utilities & recurring", icon: "recurring" as IconName, cells: analysis.places.map((place) => { const total = computeMonthlyTotal(place); const recurring = place.financials.recurring.map((item) => `${item.label}: ${formatMoney(item.amount)}`).join(" · "); return { value: total.label, evidence: total.evidence, note: recurring }; }) },
    { label: "Fees", icon: "fees" as IconName, emphasis: true, cells: analysis.places.map((place) => ({ value: place.financials.fees.map((fee) => `${fee.label} ${formatMoney(fee.amount)}`).join(" · ") || "Not published", evidence: evidenceForCosts(place.financials.fees), note: place.financials.fees.map((fee) => fee.note).join(" ") || "The listing does not publish an application or other fee." })) },
    { label: "Move-in cash total", icon: "cash" as IconName, cells: analysis.places.map((place) => { const total = computeMoveInCash(place); return { value: total.label, evidence: total.evidence, note: place.financials.publishedMoveIn.note }; }) },
    { label: "Lease vs program dates", icon: "calendar" as IconName, cells: analysis.places.map((place) => ({ value: computeLeaseFit(place, sample.student.programMonths, sample.student.programStart, sample.student.programEnd), evidence: place.lease.summary.evidence, note: place.lease.summary.whyItMatters })) },
    { label: "Rest & privacy", icon: "rest" as IconName, cells: analysis.places.map((place) => ({ value: place.restPrivacy.value, evidence: place.restPrivacy.evidence, note: place.restPrivacy.whyItMatters })) },
    { label: "Campus + evening return", icon: "transit" as IconName, cells: analysis.places.map((place) => ({ value: place.campusEvening.value, evidence: place.campusEvening.evidence, note: place.campusEvening.whyItMatters })) },
    { label: "Visual evidence", icon: "camera" as IconName, emphasis: true, cells: analysis.places.map((place) => { const media = mediaFixture.places.find((item) => item.id === place.id)!; return { value: `${media.photoCount} photos${media.shared.length ? ` · ${media.shared.length} reused` : ""}`, evidence: (media.photoCount >= 8 ? "confirmed" : "inferred") as Evidence, note: media.photoCount >= 8 ? "Substantial listing-photo coverage; exact-unit coverage still needs confirmation." : "Limited listing-photo coverage. Request a live tour of the exact unit." }; }) },
    { label: "Listing checks", icon: "duplicate" as IconName, emphasis: true, cells: analysis.places.map((place) => { const findings = listingFixture.cross_listing_findings.filter((finding) => finding.placeIds.includes(place.id)); return { value: findings.map((finding) => finding.finding).join(" "), evidence: "confirmed" as Evidence, note: findings.map((finding) => finding.whyItMatters).join(" "), attention: place.id === "haste-27" ? "pause" as const : "warning" as const }; }) },
    { label: "Biggest unresolved question", icon: "question" as IconName, cells: analysis.places.map((place) => ({ value: place.biggestQuestion.value, evidence: place.biggestQuestion.evidence, note: place.biggestQuestion.whyItMatters })) },
  ], []);

  return (
    <><AppHeader screen="compare" /><main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><button type="button" onClick={onBack} className="mb-5 text-sm font-semibold text-teal-900 hover:underline">← Edit your needs</button><p className="text-sm font-semibold text-teal-900">Step 2 · Compare places</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">See what fits—and what needs an answer.</h1><p className="mt-3 max-w-2xl leading-7 text-stone-600">Start with application requirements and cost. Then review lease timing, daily life, and missing details.</p></div><div className="flex flex-wrap gap-2"><Badge tone={favorites.length ? "confirmed" : "unknown"}>♥ {favorites.length} saved</Badge><EvidenceBadge evidence="confirmed" /><EvidenceBadge evidence="inferred" /><EvidenceBadge evidence="unknown" /></div></div>
      <nav className="sticky top-2 z-30 mb-6 flex items-center gap-2 overflow-x-auto rounded-lg border border-stone-200 bg-white/95 p-2 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur" aria-label="Comparison sections"><span className="px-2 text-xs uppercase tracking-wide text-stone-400">On this page</span>{[["#summary", "Summary"], ["#comparison-details", "Full comparison"], ["#photos", "Photos"], ["#market-notes", "Market notes"]].map(([href, label]) => <a key={href} href={href} className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-teal-50 hover:text-teal-900">{label}</a>)}</nav>
      <section id="summary" className="mb-6 scroll-mt-6 rounded-lg bg-teal-950 p-5 text-white sm:p-6" aria-labelledby="decision-order-heading"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Review in this order</p><h2 id="decision-order-heading" className="mt-2 text-xl font-semibold">Can I apply? → What will I pay? → Does the lease fit? → What do I still need to ask?</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["qualification", "1", "Application", "Check requirements first"], ["cash", "2", "Cost", "Monthly + move-in"], ["calendar", "3", "Lease", "Compare with school dates"], ["question", "4", "Questions", "Ask before payment"]].map(([icon, number, label, description]) => <div className="flex items-center gap-3 rounded-md bg-white/10 p-3" key={label}><Icon name={icon as IconName} className="text-teal-100" /><div><p className="text-xs text-teal-200">{number}. {label}</p><p className="text-sm font-semibold">{description}</p></div></div>)}</div></section>
      <section className="mb-6 grid gap-3 lg:grid-cols-3" aria-label="At-a-glance decision signals">{analysis.places.map((place, index) => { const monthly = computeMonthlyTotal(place); return <Card className="overflow-hidden" key={place.id}><div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4"><p className="font-semibold">{String.fromCharCode(65 + index)}. {place.nickname}</p><div className="flex items-center gap-2"><FavoriteButton placeId={place.id} saved={favorites.includes(place.id)} onToggle={onToggleFavorite} /><button onClick={() => onOpen(index)} className="text-sm font-semibold text-teal-900 hover:underline" type="button">Open →</button></div></div><div className="grid grid-cols-2 divide-x divide-stone-200"><div className="p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="qualification" className="h-4 w-4" />Qualification</div><p className="mt-2 text-sm font-semibold leading-5">{place.actionLane}</p></div><div className="p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="cash" className="h-4 w-4" />Monthly</div><p className="mt-2 text-lg font-semibold text-teal-950">{monthly.label}</p></div></div></Card>; })}</section>
      <section id="comparison-details" className="scroll-mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead><tr className="border-b border-stone-200 bg-stone-50"><th className="sticky left-0 z-20 w-48 bg-stone-50 p-5 text-sm font-semibold text-stone-600">Compare</th>{analysis.places.map((place, index) => <th className="w-[30%] p-5 align-top" key={place.id}><p className="text-lg font-semibold">{String.fromCharCode(65 + index)}. {place.nickname}</p><button onClick={() => onOpen(index)} className="mt-3 text-sm font-semibold text-teal-900 hover:underline" type="button">Open decision plan →</button></th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr className={`border-b border-stone-200 last:border-0 ${row.emphasis ? "bg-teal-50/50" : ""}`} key={row.label}><th scope="row" className={`sticky left-0 z-10 p-5 align-top text-sm font-semibold ${row.emphasis ? "bg-teal-50 text-teal-950" : "bg-white text-stone-700"}`}><span className="flex items-center gap-2"><Icon name={row.icon} className={row.emphasis ? "text-teal-900" : "text-stone-400"} />{row.label}</span></th>{row.cells.map((cell, index) => <td className="border-l border-stone-200 p-5 align-top" key={`${row.label}-${analysis.places[index].id}`}><ClaimCell {...cell} /></td>)}</tr>)}</tbody>
        </table>
      </section>
      <section id="photos" className="mt-8 scroll-mt-6" aria-labelledby="visual-evidence-heading"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-teal-900">Listing photos</p><h2 id="visual-evidence-heading" className="mt-1 text-2xl font-semibold">See how much each listing actually shows.</h2></div><Badge tone="sample">28 listing photos · {mediaFixture.collectedAt}</Badge></div><div className="grid gap-4 lg:grid-cols-3">{mediaFixture.places.map((media) => <Card className="overflow-hidden" key={media.id}><PhotoEvidence media={media} /><div className="p-5"><p className="font-semibold">{media.nickname}</p><p className="mt-2 text-sm leading-6 text-stone-600">{media.walk.minutes}-minute estimated straight-line walk to campus · {media.walk.distance}. Confirm the route and evening conditions yourself.</p></div></Card>)}</div><p className="mt-3 text-xs leading-5 text-stone-500">Photos, locations, and listing terms came from dated public sources. Only the student profile is fictional.</p></section>
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5"><p className="text-sm font-semibold text-red-900">Pause before payment</p><p className="mt-2 leading-7 text-red-950">{pauseFinding.finding} {pauseFinding.whyItMatters}</p></div>
      <section id="market-notes" className="mt-8 scroll-mt-6 rounded-lg border border-stone-200 bg-white p-5 sm:p-6" aria-labelledby="market-patterns-heading"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-teal-900">Market notes</p><h2 id="market-patterns-heading" className="mt-1 text-2xl font-semibold">Patterns found in four Bay Area searches</h2></div><p className="text-xs text-stone-500">Collected {marketFixture.collectedAt} · Public listing pages</p></div><div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">{marketFixture.patterns.map((pattern) => { const icon: IconName = pattern.id === "duplicates" ? "duplicate" : pattern.id === "two-prices" || pattern.id === "price-mismatch" ? "price" : "stale"; const warning = pattern.tone === "warning"; return <div className={`rounded-lg border p-4 ${warning ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`} key={pattern.id}><Icon name={icon} className={warning ? "text-amber-700" : "text-slate-600"} /><p className="mt-4 font-semibold">{pattern.label}</p><p className="mt-2 text-sm leading-6 text-stone-600">{pattern.finding}</p></div>; })}</div><p className="mt-4 text-sm leading-6 text-stone-600">These are signs to investigate, not conclusions about a home. We did not include an SF State result because the first search did not return enough information.</p></section>
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
      <nav className="sticky top-2 z-30 mb-5 flex items-center gap-2 overflow-x-auto rounded-lg border border-stone-200 bg-white/95 p-2 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur" aria-label="Place review sections"><span className="px-2 text-xs uppercase tracking-wide text-stone-400">On this page</span>{[["#overview", "Overview"], ["#location", "Photos & location"], ["#fit", "Fit & tradeoffs"], ["#actions", "Next steps"], ["#message", "Message"]].map(([href, label]) => <a key={href} href={href} className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-teal-50 hover:text-teal-900">{label}</a>)}</nav>
      <Card id="overview" className="scroll-mt-6 overflow-hidden"><div className="grid gap-6 border-b border-stone-200 p-6 sm:p-8 lg:grid-cols-[1fr_auto]"><div><p className="text-sm font-semibold text-teal-900">Step 3 · Verify before you commit</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{place.nickname}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">{place.headline.value}</p><div className="mt-5"><FavoriteButton placeId={place.id} saved={favorites.includes(place.id)} onToggle={onToggleFavorite} /></div></div><div className="min-w-44 rounded-lg bg-teal-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-teal-900">Estimated monthly</p><p className="mt-2 text-3xl font-semibold text-teal-950">{monthly.label}</p><p className="mt-2 text-xs text-stone-500">Calculated from stated amounts</p></div></div><div className={`border-b p-5 sm:px-8 ${laneClass}`}><p className="text-xs font-semibold uppercase tracking-wide">What to do now</p><p className="mt-1 text-xl font-semibold">{place.actionLane}</p></div></Card>

      <section id="location" className="mt-5 grid scroll-mt-6 gap-5 lg:grid-cols-2" aria-label="Photos and location"><Card className="overflow-hidden"><PhotoEvidence media={media} full /><div className="p-5"><p className="font-semibold">Listing photos: {media.nickname}</p><p className="mt-2 text-xs leading-5 text-stone-500">These photos came from the public listing. Confirm that a live tour shows the exact unit.</p></div></Card><Card className="overflow-hidden"><iframe title={`Map near ${media.nickname}`} src={media.osmEmbed} loading="lazy" className="aspect-[4/3] w-full border-0" /><div className="p-5"><div className="flex items-start gap-3"><Icon name="location" className="mt-1 text-teal-900" /><div><p className="font-semibold">{media.walk.minutes}-minute estimated walk</p><p className="text-sm text-stone-500">{media.walk.distance} · straight-line estimate, not a confirmed route</p></div></div><div className="mt-5 flex flex-wrap gap-3"><a href={media.mapLink} target="_blank" rel="noreferrer" className="rounded-md bg-teal-900 px-4 py-2 text-sm font-semibold text-white">Open in Maps ↗</a><a href={media.streetViewLink} target="_blank" rel="noreferrer" className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700">See the street ↗</a></div></div></Card></section>

      <section id="fit" className="mt-5 grid scroll-mt-6 gap-3 md:grid-cols-3" aria-label="Most important decision signals"><Card className="p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="qualification" className="text-teal-800" />Can I apply?</div><p className="mt-3 font-semibold leading-6">{place.qualification.summary.value}</p><div className="mt-3"><EvidenceBadge evidence={place.qualification.summary.evidence} /></div></Card><Card className="p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="cash" className="text-teal-800" />Estimated cost</div><p className="mt-3 text-2xl font-semibold text-teal-950">{monthly.label}</p><p className="mt-2 text-sm text-stone-500">Plus {computeMoveInCash(place).label} at move-in</p></Card><Card className="p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="calendar" className="text-teal-800" />Lease fit</div><p className="mt-3 font-semibold leading-6">{computeLeaseFit(place, sample.student.programMonths, sample.student.programStart, sample.student.programEnd)}</p><div className="mt-3"><EvidenceBadge evidence={place.lease.summary.evidence} /></div></Card></section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">{sectionNames.map(([key, name, icon]) => <Card className={key === "trustVerification" ? "p-6 lg:col-span-2" : "p-6"} key={key}><h2 className="flex items-center gap-3 text-xl font-semibold"><span className="grid h-9 w-9 place-items-center rounded-md bg-teal-50 text-teal-900"><Icon name={icon} /></span>{name}</h2><div className="mt-5 space-y-5">{place.sections[key].map((claim, index) => <div className="border-t border-stone-200 pt-4 first:border-0 first:pt-0" key={`${key}-${index}`}><div className="flex flex-wrap items-start justify-between gap-3"><p className="max-w-2xl font-medium leading-6">{claim.value}</p><EvidenceBadge evidence={claim.evidence} /></div><p className="mt-2 text-sm leading-6 text-stone-500"><span className="font-semibold text-stone-700">Why this matters to you:</span> {claim.whyItMatters}</p></div>)}</div></Card>)}</div>

      <div id="actions" className="mt-8 grid scroll-mt-6 gap-5 lg:grid-cols-3"><Card className="p-6"><p className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Icon name="actions" />Top 3 next actions</p><ol className="mt-5 space-y-4">{place.nextActions.map((action, index) => <li className="flex gap-3" key={index}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-teal-50 text-sm font-semibold text-teal-900">{index + 1}</span><p className="text-sm leading-6">{action.split(/(?<=\.)\s/)[0]}</p></li>)}</ol></Card><Card className="p-6"><p className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Icon name="document" />Document checklist</p><ul className="mt-5 space-y-3">{place.documents.map((document) => <li className="flex gap-3 text-sm leading-6" key={document}><span aria-hidden="true" className="text-teal-800">□</span>{document}</li>)}</ul></Card><Card className="p-6"><p className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Icon name="question" />Ask the landlord</p><ul className="mt-5 space-y-3">{place.landlordQuestions.slice(0, 6).map((question) => <li className="border-t border-stone-200 pt-3 text-sm leading-6 first:border-0 first:pt-0" key={question}>{question}</li>)}</ul></Card></div>

      <Card id="message" className="mt-5 scroll-mt-6 p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold text-teal-900">Landlord inquiry</p><h2 className="mt-1 text-xl font-semibold">Review before you send</h2></div><Button variant="secondary" onClick={copyEmail}>{copied ? "Copied" : "Copy email"}</Button></div><div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-5"><p className="font-semibold">Subject: {place.draftEmail.subject}</p><p className="mt-4 whitespace-pre-line text-sm leading-7 text-stone-700">{place.draftEmail.body}</p></div></Card>
      <Disclaimer />
    </main></>
  );
}

function Disclaimer() {
  return <p className="mx-auto mt-10 max-w-4xl border-t border-stone-200 pt-6 text-center text-xs leading-5 text-stone-500">Stateside does not rate safety or guarantee approval. It organizes the information you provide and highlights what to confirm before you commit.</p>;
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
