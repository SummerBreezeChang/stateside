"use client";
/* eslint-disable @next/next/no-img-element -- evidence galleries need direct load-failure handling for archived listing assets */

import { useEffect, useMemo, useState } from "react";
import fixture from "../fixtures/analysis.json";
import listingFixture from "../fixtures/listings.json";
import marketFixture from "../fixtures/markets.json";
import mediaFixture from "../fixtures/media.json";
import searchFixture from "../fixtures/where-to-search.json";
import sample from "../data/sample-input.json";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
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

type Screen = "landing" | "guide" | "setup" | "loading" | "compare" | "detail" | "error" | "malformed";

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

function WhereToSearch() {
  const [selectedSchoolId, setSelectedSchoolId] = useState("uc-berkeley");
  const selectedSchool = searchFixture.school_directory.find((item) => item.id === selectedSchoolId)!;
  const campus = searchFixture.campuses.find((item) => item.id === "uc-berkeley")!;
  const international = campus.for_international_students;
  return <section id="where-to-search" className="scroll-mt-24" aria-labelledby="where-to-search-heading">
    <div className="mb-5 rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-teal-900">Bay Area school directory</p><h2 id="where-to-search-heading" className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Which school are you attending?</h2><p className="mt-3 max-w-3xl leading-7 text-stone-600">Choose a school to find an official starting point. These are common research routes—not endorsements of any listing, landlord, or platform.</p></div><Badge tone="sample">7 schools · expanding</Badge></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Bay Area schools">{searchFixture.school_directory.map((school) => <button key={school.id} type="button" onClick={() => setSelectedSchoolId(school.id)} aria-pressed={selectedSchoolId === school.id} className={`rounded-lg border p-4 text-left transition ${selectedSchoolId === school.id ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700" : "border-stone-200 bg-white hover:border-teal-300 hover:bg-teal-50/50"}`}><span className="block font-semibold text-stone-900">{school.name}</span><span className="mt-1 block text-xs text-stone-500">{school.city}</span><span className={`mt-3 inline-flex rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${school.status === "Full demo" ? "bg-teal-900 text-white" : "bg-stone-100 text-stone-600"}`}>{school.status}</span></button>)}</div>
    </div>
    {selectedSchoolId !== "uc-berkeley" ? <Card className="overflow-hidden border-teal-200"><div className="border-b border-teal-100 bg-teal-50 p-6 sm:p-8"><Badge tone="sample">Directory preview</Badge><h3 className="mt-4 text-2xl font-semibold">Start your {selectedSchool.name} housing search</h3><p className="mt-3 max-w-3xl leading-7 text-stone-600">We have identified the school’s housing resource as a first stop. The complete school-specific comparison path is still being expanded.</p></div><div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1fr_.8fr]"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Official starting point</p><h4 className="mt-2 text-xl font-semibold">{selectedSchool.resource_name}</h4><p className="mt-3 text-sm leading-6 text-stone-700">Use the school resource to learn its housing process and find available search tools. Verify every property’s identity, availability, cost, qualification rules, and lease terms independently.</p><a href={selectedSchool.resource_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-md bg-teal-900 px-4 py-2 text-sm font-semibold text-white">Open official resource ↗</a></div><div className="rounded-xl bg-teal-950 p-5 text-white"><Badge tone="sample">Common routes, not endorsements</Badge><p className="mt-4 font-semibold">Then widen and refine</p><ol className="mt-3 space-y-3 text-sm leading-6 text-teal-50"><li>1. Check the university resource first.</li><li>2. Search established rental platforms and local listings.</li><li>3. Bring up to three listings back to Stateside.</li><li>4. Compare costs, qualification, dates, commute, and unanswered questions.</li></ol></div></div><p className="border-t border-stone-200 bg-stone-50 px-6 py-4 text-xs leading-5 text-stone-500 sm:px-8">{searchFixture._meta.honesty} Links are starting points; students must independently verify each housing option.</p></Card> :
    <Card className="overflow-hidden border-teal-200">
      <div className="border-b border-teal-100 bg-teal-50 p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-teal-900">Selected campus · {campus.name}</p><h3 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Where to start looking</h3><p className="mt-3 max-w-3xl leading-7 text-stone-600">Start with the university board, then widen your search. Find listings on these sites and bring the details back to Stateside to compare.</p></div><Badge tone="confirmed">Curated directory</Badge></div></div>
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.05fr_.95fr]">
        <div><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><Badge tone="confirmed">University board</Badge><h3 className="mt-3 text-xl font-semibold">{campus.start_here.name}</h3></div><a href={campus.start_here.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-teal-800 bg-white px-4 py-2 text-sm font-semibold text-teal-900">Open site ↗</a></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Why start here</p><p className="mt-2 text-sm leading-6 text-stone-700">{campus.start_here.why}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-amber-800">What to watch for</p><p className="mt-2 text-sm leading-6 text-stone-700">{campus.start_here.watch_for}</p></div></div></div>
          <div className="mt-5"><p className="text-sm font-semibold text-stone-500">Also try</p><div className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200">{campus.also_try.map((source) => <div className="grid gap-4 p-4 sm:grid-cols-[.7fr_1fr_1fr] sm:items-start" key={source.name}><div><a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-900 underline decoration-teal-300 underline-offset-4">{source.name} ↗</a></div><div><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Good for</p><p className="mt-1 text-sm leading-6 text-stone-700">{source.why}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Watch for</p><p className="mt-1 text-sm leading-6 text-stone-700">{source.watch_for}</p></div></div>)}</div></div>
        </div>
        <aside className="rounded-xl bg-teal-950 p-6 text-white" aria-labelledby="international-resources-heading"><Badge tone="sample">Common routes, not endorsements</Badge><h3 id="international-resources-heading" className="mt-4 text-2xl font-semibold">{international.heading}</h3><p className="mt-3 text-sm leading-6 text-teal-100">{international.note}</p><p className="mt-3 text-sm font-semibold text-amber-200">Requirements vary by landlord.</p><div className="mt-6 space-y-4">{international.resources.map((resource) => <div className="border-t border-white/15 pt-4 first:border-0 first:pt-0" key={resource.name}><a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline decoration-teal-400 underline-offset-4">{resource.name} ↗</a><p className="mt-2 text-sm leading-6 text-teal-100">{resource.what}</p></div>)}</div><div className="mt-7 border-t border-white/15 pt-5"><p className="text-sm font-semibold">Documents to prepare</p><ul className="mt-3 space-y-3">{international.documents_to_prepare.map((document) => <li className="flex gap-3 text-sm leading-6 text-teal-50" key={document}><span aria-hidden="true" className="text-teal-300">□</span>{document}</li>)}</ul></div></aside>
      </div>
      <p className="border-t border-stone-200 bg-stone-50 px-6 py-4 text-xs leading-5 text-stone-500 sm:px-8">{searchFixture._meta.honesty}</p>
    </Card>}
  </section>;
}

function LandingScreen({ onStart, onGuide, savedCount }: { onStart: () => void; onGuide: () => void; savedCount: number }) {
  return <><AppHeader screen="landing" onStart={onStart} /><main>
    <section className="overflow-hidden bg-cover bg-center text-white" style={{ backgroundImage: "linear-gradient(90deg, rgba(5,47,46,.96) 0%, rgba(5,47,46,.88) 38%, rgba(5,47,46,.28) 72%, rgba(15,23,42,.12) 100%), url('/stateside-flow-v3.jpg')" }}>
      <div className="mx-auto flex min-h-[78vh] max-w-6xl items-center px-5 py-16 sm:px-8 sm:py-24"><div className="hero-arrive max-w-3xl"><Badge tone="sample">For international students renting in the U.S.</Badge><h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">Compare rentals before you apply or pay.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-teal-50">Bring rent, application requirements, lease dates, location, photos, and missing details into one view—so you can see what fits and what to ask next.</p><div className="mt-5 flex flex-col items-start"><p className="order-2 mt-5 text-sm text-teal-100 sm:order-1 sm:mt-0">No account, payment, or personal documents required</p><div className="order-1 sm:order-2 sm:mt-8"><Button variant="secondary" size="lg" onClick={onStart}>Start comparing <span aria-hidden="true">→</span></Button></div></div></div></div>
    </section>
    <section id="how-it-works" className="reveal-left mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24"><p className="text-sm font-semibold text-teal-900">How it works</p><h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Three steps from shortlist to next steps.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">Use places you already found on a rental site or university portal. Select any card to begin the guided sample.</p><div className="mt-10 grid gap-5 md:grid-cols-3">{[["1", "Tell us what you need", "Review school dates, application situation, transportation, and housing priorities."], ["2", "Choose places", "Select one to three researched listings for the prepared Berkeley sample."], ["3", "Review and verify", "Compare the same questions, then open a plan showing what to confirm and ask."]].map(([number, title, copy]) => <Card role="button" tabIndex={0} onClick={onStart} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onStart(); } }} aria-label={`${title}: begin the guided comparison`} className="group h-full cursor-pointer overflow-hidden transition hover:-translate-y-1 hover:border-teal-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2" key={title}><div className="interactive-image overflow-hidden"><StepVisual step={number} /></div><div className="p-6"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-teal-900 text-sm font-semibold text-white">{number}</span><h3 className="text-xl font-semibold">{title}</h3></div><p className="mt-4 text-sm leading-6 text-stone-600">{copy}</p><p className="mt-5 text-sm font-semibold text-teal-900">Begin here →</p></div></Card>)}</div></section>
    <section id="what-you-get" className="border-y border-stone-200 bg-white"><div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><p className="text-sm font-semibold text-teal-900">What you get</p><h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">See what fits. Know what to confirm.</h2><p className="mt-5 text-lg leading-8 text-stone-600">Rental sites help you find options. Stateside helps you understand the choice.</p><div className="mt-8 grid gap-3">{[["qualification", "Can I apply?", "Understand qualification routes before paying a fee."], ["cash", "What will it cost?", "Compare rent, monthly charges, fees, and move-in cash."], ["verification", "What is still unclear?", "Turn missing details into questions for the landlord."]].map(([icon, title, copy], index) => <button type="button" onClick={index === 0 ? onGuide : onStart} className="group flex gap-4 rounded-xl border border-stone-200 p-4 text-left transition hover:border-teal-400 hover:bg-teal-50/40 hover:shadow-md" key={title}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-teal-50 text-teal-900"><Icon name={icon as IconName} /></span><span className="flex-1"><span className="font-semibold">{title}</span><span className="mt-1 block text-sm leading-6 text-stone-600">{copy}</span></span><span aria-hidden="true" className="self-center font-semibold text-teal-900 transition group-hover:translate-x-1">→</span></button>)}</div></div><div className="interactive-collage grid grid-cols-2 gap-3 overflow-hidden rounded-[1.5rem] bg-stone-100 p-3"><img src={mediaFixture.places[0].images[1]} alt="Haste Street listing interior" className="aspect-[4/5] h-full w-full rounded-xl object-cover" /><div className="grid gap-3"><img src={mediaFixture.places[1].images[2]} alt="Second Haste Street listing interior" className="aspect-square w-full rounded-xl object-cover" /><div className="rounded-xl bg-teal-950 p-5 text-white"><Icon name="duplicate" className="text-amber-300" /><p className="mt-4 font-semibold">3 photos appear in two unit listings</p><p className="mt-2 text-xs leading-5 text-teal-100">Stateside flags the overlap so you know to confirm which photos show the unit.</p></div></div></div></div></section>
    <section className="reveal-left mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16"><Card role="button" tabIndex={0} onClick={onStart} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onStart(); } }} className="group cursor-pointer overflow-hidden border-teal-200 bg-teal-50 p-7 text-center transition hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 sm:p-10"><p className="text-sm font-semibold text-teal-900">Ready when you are</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Start with one to three places. Leave with clear next steps.</h2><p className="mt-5 text-xs text-stone-500">{savedCount} saved {savedCount === 1 ? "place" : "places"} on this device</p><p className="mt-5 font-semibold text-teal-900">Open the researched comparison →</p></Card></section>
  </main></>;
}

function QualificationGuide({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return <><AppHeader screen="guide" /><main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16"><button type="button" onClick={onBack} className="text-sm font-semibold text-teal-900 hover:underline">← Back to home</button><section className="mt-8"><p className="text-sm font-semibold text-teal-900">Can I apply?</p><h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Qualification is a question to verify—not a yes-or-no promise.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">A listing may mention credit or income without explaining what an international student can provide instead. Stateside separates what is published from what you still need to ask.</p></section><section className="mt-10 grid gap-4 md:grid-cols-3">{[["qualification", "1. Read the requirement", "Look for income multiples, credit checks, SSN requests, guarantors, deposits, and application fees."], ["document", "2. Prepare alternatives", "Admission documents, proof of funds, a sponsor letter, or a larger lawful deposit may help—but the landlord must confirm what they accept."], ["question", "3. Ask before paying", "Request the accepted qualification route in writing before submitting documents or a nonrefundable fee."]].map(([icon, title, copy]) => <Card className="p-6" key={title}><Icon name={icon as IconName} className="text-teal-900" /><h2 className="mt-5 text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-stone-600">{copy}</p></Card>)}</section><Card className="mt-8 border-amber-200 bg-amber-50 p-6 sm:p-8"><p className="text-sm font-semibold text-amber-900">What Stateside will show</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><div><Badge tone="confirmed">Confirmed</Badge><p className="mt-2 text-sm leading-6">The source states the requirement.</p></div><div><Badge tone="inferred">Inferred</Badge><p className="mt-2 text-sm leading-6">A likely implication needs confirmation.</p></div><div><Badge tone="unknown">Unknown</Badge><p className="mt-2 text-sm leading-6">The listing does not provide enough information.</p></div></div></Card><div className="mt-8"><Button size="lg" onClick={onStart}>See this in the Berkeley sample <span aria-hidden="true">→</span></Button></div><Disclaimer /></main></>;
}

function AppHeader({ screen, onStart }: { screen: Screen; onStart?: () => void }) {
  if (screen === "landing") {
    return <header className="bg-white"><div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto] items-center gap-2 px-3 py-5 sm:grid-cols-[1fr_auto_1fr] sm:px-8">
      <span aria-hidden="true" className="hidden sm:block" />
      <button type="button" onClick={() => { window.location.href = "/"; }} className="stateside-wordmark justify-self-start text-teal-950 [font-family:var(--font-unbounded)] sm:justify-self-center" aria-label="Return to Stateside home">STATESIDE</button>
      <Button onClick={onStart} className="justify-self-end whitespace-nowrap px-3 text-xs sm:px-4 sm:text-sm">Start comparing</Button>
    </div></header>;
  }
  const step = screen === "landing" || screen === "guide" || screen === "setup" ? 1 : screen === "compare" || screen === "loading" ? 2 : 3;
  const stepLabels = ["Your needs", "Compare places", "Next steps"];
  const stepInstructions = [
    "Choose priorities, review the three listings, then show your comparison.",
    "Read the summary first. Open one place when you are ready to verify it.",
    "Review photos, tradeoffs, and questions before you apply or pay.",
  ];
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-5 sm:px-8">
        <div className="hidden items-center gap-2 justify-self-start text-sm lg:flex" aria-label={`Step ${step} of 3`}>
          {["Your needs", "Compare places", "Next steps"].map((label, index) => (
            <div className="flex items-center gap-2" key={label}>
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${step >= index + 1 ? "bg-teal-900 text-white" : "bg-stone-100 text-stone-500"}`}>{index + 1}</span>
              <span className={step === index + 1 ? "font-semibold text-stone-900" : "text-stone-500"}>{label}</span>
              {index < 2 ? <span className="mx-1 text-stone-300">/</span> : null}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => { window.location.href = "/"; }} className="stateside-wordmark justify-self-center text-teal-950 [font-family:var(--font-unbounded)]" aria-label="Return to Stateside home">STATESIDE</button>
        <span className="justify-self-end"><Badge tone="sample">Berkeley demo</Badge></span>
      </div>
      {screen !== "landing" && screen !== "setup" ? <div className="border-t border-teal-100 bg-teal-50"><div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8"><p><span className="font-semibold text-teal-950">You are here: Step {step} of 3 · {stepLabels[step - 1]}</span><span className="text-stone-600"> — {stepInstructions[step - 1]}</span></p><span className="hidden shrink-0 font-semibold text-teal-900 lg:block">{step < 3 ? `Next: ${stepLabels[step]} →` : "Use the recommendation and next actions below"}</span></div></div> : null}
    </header>
  );
}

function SetupScreen({ onCompare }: { onCompare: (placeIds: string[]) => void }) {
  const [question, setQuestion] = useState(0);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState(sample.places.map((place) => place.id));
  const questions = ["Your stay", "What matters", "Your places"];

  return (
    <>
      <AppHeader screen="setup" />
      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm"><p className="font-semibold text-teal-900">Question {question + 1} of 3</p><p className="text-stone-500">About 2 minutes</p></div>
          <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Setup progress">{questions.map((label, index) => <div key={label}><div className={`h-1.5 rounded-full ${index <= question ? "bg-teal-800" : "bg-stone-200"}`} /><p className={`mt-2 hidden text-xs sm:block ${index === question ? "font-semibold text-teal-900" : "text-stone-400"}`}>{label}</p></div>)}</div>
        </div>

        {question === 0 ? <section aria-labelledby="stay-heading" className="mx-auto max-w-2xl py-4 sm:py-10">
          <p className="text-sm font-semibold text-teal-900">Let’s start with your situation</p>
          <h1 id="stay-heading" className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">How long do you need housing?</h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">School dates help us spot leases that could leave you paying for months you do not need.</p>
          <Card className="mt-8 border-teal-300 bg-teal-50 p-6">
            <Badge tone="sample">Berkeley sample</Badge>
            <h2 className="mt-4 text-xl font-semibold">UC Berkeley Master of Engineering</h2>
            <p className="mt-2 leading-7 text-stone-700">Full-time, one-academic-year program · Arrives August 12, 2026 · Needs housing through May 16, 2027</p>
            <p className="mt-3 text-sm leading-6 text-stone-600">International student · No car · No U.S. credit, SSN, income, or guarantor · Parent-funded</p>
          </Card>
          <Button className="mt-8 w-full" size="lg" onClick={() => setQuestion(1)}>Use this sample profile <span aria-hidden="true">→</span></Button>
        </section> : null}

        {question === 1 ? <section aria-labelledby="priorities-heading" className="mx-auto max-w-2xl py-4 sm:py-10">
          <p className="text-sm font-semibold text-teal-900">Researched Berkeley sample</p>
          <h1 id="priorities-heading" className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">Priorities used in this comparison</h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">The prepared analysis uses one fixed international-student profile so every demo run is consistent. These priorities are context, not editable controls.</p>
          <div className="mt-8 space-y-3">{priorities.map(([id, label]) => <Card className="flex items-center justify-between gap-5 p-4" key={id}><p className="font-semibold">{label}</p><Badge tone="sample">{sample.student.priorities[id]}</Badge></Card>)}</div>
          <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950"><span className="font-semibold">Demo boundary:</span> Changing a profile or asking GPT-5.6 to research new listings is the next product phase. This version shows a dated, pre-researched comparison only.</div>
          <div className="mt-8 flex gap-3"><Button variant="secondary" onClick={() => setQuestion(0)}>Back</Button><Button className="flex-1" size="lg" onClick={() => setQuestion(2)}>Add places to compare <span aria-hidden="true">→</span></Button></div>
        </section> : null}

        {question === 2 ? <section aria-labelledby="places-heading" className="py-4">
          <p className="text-sm font-semibold text-teal-900">Choose the prepared evidence</p>
          <h1 id="places-heading" className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">Select one to three researched places</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">For the demo, choose from three Berkeley listings that Stateside has already researched. You can compare one place or build a shortlist of up to three.</p>
          <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5"><p className="font-semibold">How the future live flow will work</p><p className="mt-2 text-sm leading-6 text-stone-600">Search a university or rental site → return to Stateside → paste the listing link or text → review what GPT-5.6 extracted → add it to your comparison.</p><details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-teal-900">Search school housing resources</summary><div className="mt-5"><WhereToSearch /></div></details></div>
          <div className="mt-6 space-y-4">{sample.places.map((place, index) => { const selected = selectedPlaceIds.includes(place.id); return <Card className={`p-5 ${selected ? "border-teal-500 bg-teal-50/40" : ""}`} key={place.id}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-teal-900 text-sm font-semibold text-white">{String.fromCharCode(65 + index)}</span><div><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Researched listing</p><h2 className="font-semibold">{place.nickname}</h2></div></div><button type="button" onClick={() => setSelectedPlaceIds((current) => selected ? current.filter((id) => id !== place.id) : current.length < 3 ? [...current, place.id] : current)} className={`rounded-md border px-4 py-2 text-sm font-semibold ${selected ? "border-stone-300 bg-white text-stone-700" : "border-teal-800 bg-teal-900 text-white"}`}>{selected ? "Remove" : "Add this place"}</button></div><p className="mt-4 text-sm leading-6 text-stone-600">{place.listingText.split(".")[0]}.</p></Card>; })}</div>
          <p className="mt-4 text-sm font-semibold text-teal-900">{selectedPlaceIds.length} of 3 places selected</p>
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><span className="font-semibold">Researched Berkeley sample:</span> These results are precomputed from dated public sources. Pasting arbitrary links is not enabled in this demo.</div>
          <div className="mt-6 flex gap-3"><Button variant="secondary" onClick={() => setQuestion(1)}>Back</Button><Button className="flex-1" disabled={selectedPlaceIds.length === 0} onClick={() => onCompare(selectedPlaceIds)} size="lg">View the researched comparison <span aria-hidden="true">→</span></Button></div>
          <p className="mt-3 text-center text-xs leading-5 text-stone-500">No application or payment is made. Review every detail with the original source.</p>
        </section> : null}
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

function CompareScreen({ placeIds, onBack, onOpen, favorites, onToggleFavorite }: { placeIds: string[]; onBack: () => void; onOpen: (index: number) => void; favorites: string[]; onToggleFavorite: (placeId: string) => void }) {
  const pauseFinding = listingFixture.cross_listing_findings.find((finding) => finding.id === "wrong-unit-reference")!;
  const places = useMemo(() => analysis.places.filter((place) => placeIds.includes(place.id)), [placeIds]);
  const rows = useMemo(() => [
    { label: "Headline status", icon: "status" as IconName, cells: places.map((place) => ({ value: place.headline.value, evidence: place.headline.evidence, note: place.headline.whyItMatters })) },
    { label: "Can I qualify?", icon: "qualification" as IconName, emphasis: true, cells: places.map((place) => ({ value: place.qualification.summary.value, evidence: place.qualification.summary.evidence, note: place.qualification.route })) },
    { label: "Monthly rent", icon: "rent" as IconName, cells: places.map((place) => ({ value: formatMoney(place.financials.monthlyRent.amount), evidence: place.financials.monthlyRent.evidence, note: place.financials.monthlyRent.note })) },
    { label: "Utilities & recurring", icon: "recurring" as IconName, cells: places.map((place) => { const total = computeMonthlyTotal(place); const recurring = place.financials.recurring.map((item) => `${item.label}: ${formatMoney(item.amount)}`).join(" · "); return { value: total.label, evidence: total.evidence, note: recurring }; }) },
    { label: "Fees", icon: "fees" as IconName, emphasis: true, cells: places.map((place) => ({ value: place.financials.fees.map((fee) => `${fee.label} ${formatMoney(fee.amount)}`).join(" · ") || "Not published", evidence: evidenceForCosts(place.financials.fees), note: place.financials.fees.map((fee) => fee.note).join(" ") || "The listing does not publish an application or other fee." })) },
    { label: "Move-in cash total", icon: "cash" as IconName, cells: places.map((place) => { const total = computeMoveInCash(place); return { value: total.label, evidence: total.evidence, note: place.financials.publishedMoveIn.note }; }) },
    { label: "Lease vs program dates", icon: "calendar" as IconName, cells: places.map((place) => ({ value: computeLeaseFit(place, sample.student.programMonths, sample.student.programStart, sample.student.programEnd), evidence: place.lease.summary.evidence, note: place.lease.summary.whyItMatters })) },
    { label: "Rest & privacy", icon: "rest" as IconName, cells: places.map((place) => ({ value: place.restPrivacy.value, evidence: place.restPrivacy.evidence, note: place.restPrivacy.whyItMatters })) },
    { label: "Campus + evening return", icon: "transit" as IconName, cells: places.map((place) => ({ value: place.campusEvening.value, evidence: place.campusEvening.evidence, note: place.campusEvening.whyItMatters })) },
    { label: "Visual evidence", icon: "camera" as IconName, emphasis: true, cells: places.map((place) => { const media = mediaFixture.places.find((item) => item.id === place.id)!; return { value: `${media.photoCount} photos${media.shared.length ? ` · ${media.shared.length} reused` : ""}`, evidence: (media.photoCount >= 8 ? "confirmed" : "inferred") as Evidence, note: media.photoCount >= 8 ? "Substantial listing-photo coverage; exact-unit coverage still needs confirmation." : "Limited listing-photo coverage. Request a live tour of the exact unit." }; }) },
    { label: "Listing checks", icon: "duplicate" as IconName, emphasis: true, cells: places.map((place) => { const findings = listingFixture.cross_listing_findings.filter((finding) => finding.placeIds.includes(place.id)); return { value: findings.map((finding) => finding.finding).join(" "), evidence: "confirmed" as Evidence, note: findings.map((finding) => finding.whyItMatters).join(" "), attention: place.id === "haste-27" ? "pause" as const : "warning" as const }; }) },
    { label: "Biggest unresolved question", icon: "question" as IconName, cells: places.map((place) => ({ value: place.biggestQuestion.value, evidence: place.biggestQuestion.evidence, note: place.biggestQuestion.whyItMatters })) },
  ], [places]);

  return (
    <><AppHeader screen="compare" /><main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><button type="button" onClick={onBack} className="mb-5 text-sm font-semibold text-teal-900 hover:underline">← Edit your needs</button><p className="text-sm font-semibold text-teal-900">Step 2 · Compare places</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">See what fits—and what needs an answer.</h1><p className="mt-3 max-w-2xl leading-7 text-stone-600">Start with application requirements and cost. Then review lease timing, daily life, and missing details.</p></div><div className="flex flex-wrap gap-2"><Badge tone={favorites.length ? "confirmed" : "unknown"}>♥ {favorites.length} saved</Badge><EvidenceBadge evidence="confirmed" /><EvidenceBadge evidence="inferred" /><EvidenceBadge evidence="unknown" /></div></div>
      <section id="photos" className="mb-8 scroll-mt-6" aria-labelledby="visual-evidence-heading"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-teal-900">Start with the rooms</p><h2 id="visual-evidence-heading" className="mt-1 text-2xl font-semibold">See what each listing actually shows.</h2></div><Badge tone="sample">Researched {mediaFixture.collectedAt}</Badge></div><div className="grid gap-4 lg:grid-cols-3">{mediaFixture.places.filter((media) => placeIds.includes(media.id)).map((media) => <Card className="overflow-hidden" key={media.id}><PhotoEvidence media={media} /><div className="p-5"><p className="font-semibold">{media.nickname}</p><p className="mt-2 text-sm leading-6 text-stone-600">{media.walk.minutes}-minute estimated straight-line walk to campus · {media.walk.distance}. Confirm the route and evening conditions yourself.</p></div></Card>)}</div><p className="mt-3 text-xs leading-5 text-stone-500">Photos, locations, and listing terms came from dated public sources. Photos show what the landlord chose to share and do not replace a live tour.</p></section>
      <nav className="sticky top-2 z-30 mb-6 flex items-center gap-2 overflow-x-auto rounded-lg border border-stone-200 bg-white/95 p-2 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur" aria-label="Comparison sections"><span className="px-2 text-xs uppercase tracking-wide text-stone-400">On this page</span>{[["#photos", "Photos"], ["#summary", "Summary"], ["#comparison-details", "Full comparison"], ["#market-notes", "Market notes"]].map(([href, label]) => <a key={href} href={href} className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-teal-50 hover:text-teal-900">{label}</a>)}</nav>
      <section id="summary" className="mb-6 scroll-mt-6 rounded-lg bg-teal-950 p-5 text-white sm:p-6" aria-labelledby="decision-order-heading"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Review in this order</p><h2 id="decision-order-heading" className="mt-2 text-xl font-semibold">Can I apply? → What will I pay? → Does the lease fit? → What do I still need to ask?</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["qualification", "1", "Application", "Check requirements first"], ["cash", "2", "Cost", "Monthly + move-in"], ["calendar", "3", "Lease", "Compare with school dates"], ["question", "4", "Questions", "Ask before payment"]].map(([icon, number, label, description]) => <div className="flex items-center gap-3 rounded-md bg-white/10 p-3" key={label}><Icon name={icon as IconName} className="text-teal-100" /><div><p className="text-xs text-teal-200">{number}. {label}</p><p className="text-sm font-semibold">{description}</p></div></div>)}</div></section>
      <section className="mb-6 grid gap-3 lg:grid-cols-3" aria-label="At-a-glance decision signals">{places.map((place, index) => { const monthly = computeMonthlyTotal(place); const originalIndex = analysis.places.findIndex((item) => item.id === place.id); return <Card className="overflow-hidden" key={place.id}><div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4"><p className="font-semibold">{String.fromCharCode(65 + index)}. {place.nickname}</p><div className="flex items-center gap-2"><FavoriteButton placeId={place.id} saved={favorites.includes(place.id)} onToggle={onToggleFavorite} /><button onClick={() => onOpen(originalIndex)} aria-label={`Open ${place.nickname} decision plan`} className="text-sm font-semibold text-teal-900 hover:underline" type="button">Open plan →</button></div></div><div className="grid grid-cols-2 divide-x divide-stone-200"><div className="p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="qualification" className="h-4 w-4" />Qualification</div><p className="mt-2 text-sm font-semibold leading-5">{place.actionLane}</p></div><div className="p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="cash" className="h-4 w-4" />Monthly</div><p className="mt-2 text-lg font-semibold text-teal-950">{monthly.label}</p></div></div></Card>; })}</section>
      <section className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-5" aria-labelledby="decision-heading"><p className="text-sm font-semibold text-teal-900">Current conclusion</p><h2 id="decision-heading" className="mt-1 text-2xl font-semibold">A clear next step for each place</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{places.map((place) => { const conclusion = place.id === "oxford-2150" ? "Best current fit to verify" : place.id === "haste-15" ? "Keep as a backup" : "Do not proceed yet"; return <div className="rounded-lg border border-teal-100 bg-white p-4" key={place.id}><p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{place.nickname}</p><p className="mt-2 font-semibold text-teal-950">{conclusion}</p><p className="mt-2 text-sm leading-6 text-stone-600">{place.actionLane}</p></div>; })}</div></section>
      <details id="comparison-details" className="scroll-mt-6 rounded-lg border border-stone-200 bg-white shadow-sm"><summary className="cursor-pointer p-5 font-semibold text-teal-900">View full comparison</summary><div className="overflow-x-auto border-t border-stone-200">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead><tr className="border-b border-stone-200 bg-stone-50"><th className="sticky left-0 z-20 w-48 bg-stone-50 p-5 text-sm font-semibold text-stone-600">Compare</th>{places.map((place, index) => { const originalIndex = analysis.places.findIndex((item) => item.id === place.id); return <th className="w-[30%] p-5 align-top" key={place.id}><p className="text-lg font-semibold">{String.fromCharCode(65 + index)}. {place.nickname}</p><button onClick={() => onOpen(originalIndex)} aria-label={`Open ${place.nickname} decision plan`} className="mt-3 text-sm font-semibold text-teal-900 hover:underline" type="button">Open {place.nickname} plan →</button></th>; })}</tr></thead>
          <tbody>{rows.map((row) => <tr className={`border-b border-stone-200 last:border-0 ${row.emphasis ? "bg-teal-50/50" : ""}`} key={row.label}><th scope="row" className={`sticky left-0 z-10 p-5 align-top text-sm font-semibold ${row.emphasis ? "bg-teal-50 text-teal-950" : "bg-white text-stone-700"}`}><span className="flex items-center gap-2"><Icon name={row.icon} className={row.emphasis ? "text-teal-900" : "text-stone-400"} />{row.label}</span></th>{row.cells.map((cell, index) => <td className="border-l border-stone-200 p-5 align-top" key={`${row.label}-${places[index].id}`}><ClaimCell {...cell} /></td>)}</tr>)}</tbody>
        </table>
      </div></details>
      {placeIds.includes("haste-27") ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5"><p className="text-sm font-semibold text-red-900">Pause before payment</p><p className="mt-2 leading-7 text-red-950">{pauseFinding.finding} {pauseFinding.whyItMatters}</p></div> : null}
      <section id="market-notes" className="mt-8 scroll-mt-6 rounded-lg border border-stone-200 bg-white p-5 sm:p-6" aria-labelledby="market-patterns-heading"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-teal-900">Market notes</p><h2 id="market-patterns-heading" className="mt-1 text-2xl font-semibold">Patterns found in four Bay Area searches</h2></div><p className="text-xs text-stone-500">Collected {marketFixture.collectedAt} · Public listing pages</p></div><div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">{marketFixture.patterns.map((pattern) => { const icon: IconName = pattern.id === "duplicates" ? "duplicate" : pattern.id === "two-prices" || pattern.id === "price-mismatch" ? "price" : "stale"; const warning = pattern.tone === "warning"; return <div className={`rounded-lg border p-4 ${warning ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`} key={pattern.id}><Icon name={icon} className={warning ? "text-amber-700" : "text-slate-600"} /><p className="mt-4 font-semibold">{pattern.label}</p><p className="mt-2 text-sm leading-6 text-stone-600">{pattern.finding}</p></div>; })}</div><p className="mt-4 text-sm leading-6 text-stone-600">These are signs to investigate, not conclusions about a home. We did not include an SF State result because the first search did not return enough information.</p></section>
      <Disclaimer />
    </main></>
  );
}

function DetailScreen({ selected, placeIds, onSelect, onBack, favorites, onToggleFavorite }: { selected: number; placeIds: string[]; onSelect: (index: number) => void; onBack: () => void; favorites: string[]; onToggleFavorite: (placeId: string) => void }) {
  const place = analysis.places[selected];
  const media = mediaFixture.places.find((item) => item.id === place.id)!;
  const monthly = computeMonthlyTotal(place);
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => { await navigator.clipboard.writeText(`Subject: ${place.draftEmail.subject}\n\n${place.draftEmail.body}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const laneClass = place.actionLane === "Pause — do not pay yet" ? "border-red-200 bg-red-50 text-red-800" : place.actionLane === "Set aside" ? "border-stone-300 bg-stone-100 text-stone-800" : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <><AppHeader screen="detail" /><main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <button type="button" onClick={onBack} className="mb-6 text-sm font-semibold text-teal-900 hover:underline">← Back to comparison</button>
      <div className="mb-8 flex flex-wrap gap-2" aria-label="Choose a place">{analysis.places.map((item, index) => ({ item, index })).filter(({ item }) => placeIds.includes(item.id)).map(({ item, index }, visibleIndex) => <button key={item.id} type="button" onClick={() => onSelect(index)} aria-pressed={selected === index} className={`rounded-md border px-4 py-2 text-sm font-semibold ${selected === index ? "border-teal-900 bg-teal-900 text-white" : "border-stone-200 bg-white text-stone-600"}`}>{String.fromCharCode(65 + visibleIndex)}. {item.nickname}</button>)}</div>
      <nav className="sticky top-2 z-30 mb-5 flex items-center gap-2 overflow-x-auto rounded-lg border border-stone-200 bg-white/95 p-2 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur" aria-label="Place review sections"><span className="px-2 text-xs uppercase tracking-wide text-stone-400">On this page</span>{[["#overview", "Overview"], ["#location", "Photos & location"], ["#fit", "Fit & tradeoffs"], ["#actions", "Next steps"], ["#message", "Message"]].map(([href, label]) => <a key={href} href={href} className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-teal-50 hover:text-teal-900">{label}</a>)}</nav>
      <Card id="overview" className="scroll-mt-6 overflow-hidden"><div className="grid gap-6 border-b border-stone-200 p-6 sm:p-8 lg:grid-cols-[1fr_auto]"><div><p className="text-sm font-semibold text-teal-900">Step 3 · Verify before you commit</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{place.nickname}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">{place.headline.value}</p><div className="mt-5"><FavoriteButton placeId={place.id} saved={favorites.includes(place.id)} onToggle={onToggleFavorite} /></div></div><div className="min-w-44 rounded-lg bg-teal-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-teal-900">Estimated monthly</p><p className="mt-2 text-3xl font-semibold text-teal-950">{monthly.label}</p><p className="mt-2 text-xs text-stone-500">Calculated from stated amounts</p></div></div><div className={`border-b p-5 sm:px-8 ${laneClass}`}><p className="text-xs font-semibold uppercase tracking-wide">What to do now</p><p className="mt-1 text-xl font-semibold">{place.actionLane}</p></div></Card>

      <div id="actions" className="mt-5 grid scroll-mt-6 gap-5 lg:grid-cols-3"><Card className="p-6"><p className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Icon name="actions" />Top 3 next actions</p><ol className="mt-5 space-y-4">{place.nextActions.map((action, index) => <li className="flex gap-3" key={index}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-teal-50 text-sm font-semibold text-teal-900">{index + 1}</span><p className="text-sm leading-6">{action}</p></li>)}</ol></Card><Card className="p-6"><p className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Icon name="document" />Document checklist</p><ul className="mt-5 space-y-3">{place.documents.map((document) => <li className="flex gap-3 text-sm leading-6" key={document}><span aria-hidden="true" className="text-teal-800">□</span>{document}</li>)}</ul></Card><Card className="p-6"><p className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Icon name="question" />Ask the landlord</p><ul className="mt-5 space-y-3">{place.landlordQuestions.slice(0, 6).map((question) => <li className="border-t border-stone-200 pt-3 text-sm leading-6 first:border-0 first:pt-0" key={question}>{question}</li>)}</ul></Card></div>

      <section id="location" className="mt-5 grid scroll-mt-6 gap-5 lg:grid-cols-2" aria-label="Photos and location"><Card className="overflow-hidden"><PhotoEvidence media={media} full /><div className="p-5"><p className="font-semibold">Listing photos: {media.nickname}</p><p className="mt-2 text-xs leading-5 text-stone-500">These photos came from the public listing. Confirm that a live tour shows the exact unit.</p></div></Card><Card className="overflow-hidden"><iframe aria-hidden="true" tabIndex={-1} title={`Map preview near ${media.nickname}`} src={media.osmEmbed} loading="lazy" className="aspect-[4/3] w-full border-0" /><div className="p-5"><div className="flex items-start gap-3"><Icon name="location" className="mt-1 text-teal-900" /><div><p className="font-semibold">{media.walk.minutes}-minute estimated walk</p><p className="text-sm text-stone-500">{media.walk.distance} · straight-line estimate, not a confirmed route</p></div></div><div className="mt-5 flex flex-wrap gap-3"><a href={media.mapLink} target="_blank" rel="noreferrer" className="rounded-md bg-teal-900 px-4 py-2 text-sm font-semibold text-white">Open accessible map ↗</a><a href={media.streetViewLink} target="_blank" rel="noreferrer" className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700">See the street ↗</a></div></div></Card></section>

      <section id="fit" className="mt-5 grid scroll-mt-6 gap-3 md:grid-cols-3" aria-label="Most important decision signals"><Card className="p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="qualification" className="text-teal-800" />Can I apply?</div><p className="mt-3 font-semibold leading-6">{place.qualification.summary.value}</p><div className="mt-3"><EvidenceBadge evidence={place.qualification.summary.evidence} /></div></Card><Card className="p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="cash" className="text-teal-800" />Estimated cost</div><p className="mt-3 text-2xl font-semibold text-teal-950">{monthly.label}</p><p className="mt-2 text-sm text-stone-500">Plus {computeMoveInCash(place).label} at move-in</p></Card><Card className="p-5"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500"><Icon name="calendar" className="text-teal-800" />Lease fit</div><p className="mt-3 font-semibold leading-6">{computeLeaseFit(place, sample.student.programMonths, sample.student.programStart, sample.student.programEnd)}</p><div className="mt-3"><EvidenceBadge evidence={place.lease.summary.evidence} /></div></Card></section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">{sectionNames.map(([key, name, icon]) => <Card className={key === "trustVerification" ? "p-6 lg:col-span-2" : "p-6"} key={key}><h2 className="flex items-center gap-3 text-xl font-semibold"><span className="grid h-9 w-9 place-items-center rounded-md bg-teal-50 text-teal-900"><Icon name={icon} /></span>{name}</h2><div className="mt-5 space-y-5">{place.sections[key].map((claim, index) => <div className="border-t border-stone-200 pt-4 first:border-0 first:pt-0" key={`${key}-${index}`}><div className="flex flex-wrap items-start justify-between gap-3"><p className="max-w-2xl font-medium leading-6">{claim.value}</p><EvidenceBadge evidence={claim.evidence} /></div><p className="mt-2 text-sm leading-6 text-stone-500"><span className="font-semibold text-stone-700">Why this matters to you:</span> {claim.whyItMatters}</p></div>)}</div></Card>)}</div>

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
  const [selectedPlaceIds, setSelectedPlaceIds] = useState(sample.places.map((place) => place.id));
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

  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    const selector = "main > section:not(:has(.hero-arrive)), main > div, main > details, main > nav, main > section > .grid > *, main > div.grid > *";
    const nodes = [...document.querySelectorAll<HTMLElement>(selector)];
    nodes.forEach((node, index) => {
      node.classList.add("motion-reveal", index % 2 ? "motion-right" : "motion-left");
      node.style.setProperty("--motion-delay", `${Math.min(index % 4, 3) * 55}ms`);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [screen]);

  const toggleFavorite = (placeId: string) => setFavorites((current) => {
    const next = current.includes(placeId) ? current.filter((id) => id !== placeId) : [...current, placeId];
    window.localStorage.setItem("stateside:favorites", JSON.stringify(next));
    return next;
  });

  const compare = (placeIds: string[]) => {
    setSelectedPlaceIds(placeIds);
    const firstSelected = analysis.places.findIndex((place) => placeIds.includes(place.id));
    setSelected(Math.max(0, firstSelected));
    setScreen("loading");
    window.setTimeout(() => {
      try { validateAnalysis(analysis); setScreen("compare"); }
      catch { setScreen("malformed"); }
    }, 700);
  };

  if (screen === "loading") return <LoadingScreen />;
  if (screen === "error" || screen === "malformed") return <StateScreen malformed={screen === "malformed"} onReset={() => setScreen("setup")} />;
  if (screen === "landing") return <LandingScreen onStart={() => setScreen("setup")} onGuide={() => setScreen("guide")} savedCount={favorites.length} />;
  if (screen === "guide") return <QualificationGuide onStart={() => setScreen("setup")} onBack={() => setScreen("landing")} />;
  if (screen === "compare") return <CompareScreen placeIds={selectedPlaceIds} onBack={() => setScreen("setup")} onOpen={(index) => { setSelected(index); setScreen("detail"); }} favorites={favorites} onToggleFavorite={toggleFavorite} />;
  if (screen === "detail") return <DetailScreen selected={selected} placeIds={selectedPlaceIds} onSelect={setSelected} onBack={() => setScreen("compare")} favorites={favorites} onToggleFavorite={toggleFavorite} />;
  return <SetupScreen onCompare={compare} />;
}
