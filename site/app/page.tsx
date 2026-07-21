"use client";

import { useEffect, useMemo, useState } from "react";
import fixture from "../fixtures/analysis.json";
import sample from "../data/sample-input.json";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
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

type Screen = "setup" | "loading" | "compare" | "detail" | "error" | "malformed";
type Priority = "essential" | "important" | "flexible";

const analysis = fixture as Analysis;
const priorities = [
  ["restAndPrivacy", "Rest & privacy"],
  ["affordability", "Affordability"],
  ["simpleCampusTrip", "Simple campus trip"],
  ["programAlignedLease", "Lease matches my stay"],
] as const;

const sectionNames: [keyof PlaceAnalysis["sections"], string][] = [
  ["restPrivacy", "Rest & privacy"],
  ["dailyLife", "Daily life & access"],
  ["totalCommitment", "Total commitment"],
  ["rentalReadiness", "Rental readiness"],
  ["trustVerification", "Trust & verification"],
];

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

function AppHeader({ screen }: { screen: Screen }) {
  const step = screen === "setup" ? 1 : screen === "compare" || screen === "loading" ? 2 : 3;
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-teal-900 font-semibold text-white">S</div>
          <div><p className="font-semibold tracking-tight">Stateside</p><p className="text-xs text-stone-500">Understand before you commit</p></div>
        </div>
        <div className="hidden items-center gap-2 text-sm sm:flex" aria-label={`Step ${step} of 3`}>
          {["Setup", "Compare", "Decision plan"].map((label, index) => (
            <div className="flex items-center gap-2" key={label}>
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${step >= index + 1 ? "bg-teal-900 text-white" : "bg-stone-100 text-stone-500"}`}>{index + 1}</span>
              <span className={step === index + 1 ? "font-semibold text-stone-900" : "text-stone-500"}>{label}</span>
              {index < 2 ? <span className="mx-1 text-stone-300">/</span> : null}
            </div>
          ))}
        </div>
        <Badge tone="sample">Sample data</Badge>
      </div>
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
          <p className="mb-3 text-sm font-semibold text-teal-900">Your shortlist, in one clear view</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">Compare the places you already found.</h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">Stateside normalizes three rentals around your stay, your qualification route, and what is still unclear—before you apply or pay.</p>
        </div>

        <Card className="mb-8 p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-sm font-semibold text-teal-900">Sample student</p><h2 className="mt-1 text-xl font-semibold">Incoming UC Berkeley graduate student</h2></div>
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
          <div><p className="text-sm font-semibold text-teal-900">Three places</p><h2 className="mt-1 text-2xl font-semibold">Review the sample listing text</h2></div>
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
          <Button onClick={onCompare} size="lg">Compare my places <span aria-hidden="true">→</span></Button>
          <p className="text-xs text-stone-500">This demo uses a structured GPT‑5.6 analysis of the labeled sample data.</p>
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

function CompareScreen({ onBack, onOpen }: { onBack: () => void; onOpen: (index: number) => void }) {
  const rows = useMemo(() => [
    { label: "Headline status", cells: analysis.places.map((place) => ({ value: place.headline.value, evidence: place.headline.evidence, note: place.headline.whyItMatters })) },
    { label: "Can I qualify?", emphasis: true, cells: analysis.places.map((place) => ({ value: place.qualification.summary.value, evidence: place.qualification.summary.evidence, note: place.qualification.route })) },
    { label: "Monthly rent", cells: analysis.places.map((place) => ({ value: formatMoney(place.financials.monthlyRent.amount), evidence: place.financials.monthlyRent.evidence, note: place.financials.monthlyRent.note })) },
    { label: "Utilities & recurring", cells: analysis.places.map((place) => { const total = computeMonthlyTotal(place); const recurring = place.financials.recurring.map((item) => `${item.label}: ${formatMoney(item.amount)}`).join(" · "); return { value: total.label, evidence: total.evidence, note: recurring }; }) },
    { label: "Fees", emphasis: true, cells: analysis.places.map((place) => ({ value: place.financials.fees.map((fee) => `${fee.label} ${formatMoney(fee.amount)}`).join(" · ") || "None stated", evidence: evidenceForCosts(place.financials.fees), note: place.financials.fees.map((fee) => fee.note).join(" ") })) },
    { label: "Move-in cash total", cells: analysis.places.map((place) => { const total = computeMoveInCash(place); return { value: total.label, evidence: total.evidence, note: "Calculated in Stateside from stated rent, deposit, and non-credited fees." }; }) },
    { label: "Lease vs program dates", cells: analysis.places.map((place) => ({ value: computeLeaseFit(place.lease.start, place.lease.end, sample.student.programStart, sample.student.programEnd), evidence: place.lease.summary.evidence, note: place.lease.summary.whyItMatters })) },
    { label: "Rest & privacy", cells: analysis.places.map((place) => ({ value: place.restPrivacy.value, evidence: place.restPrivacy.evidence, note: place.restPrivacy.whyItMatters })) },
    { label: "Campus + evening return", cells: analysis.places.map((place) => ({ value: place.campusEvening.value, evidence: place.campusEvening.evidence, note: place.campusEvening.whyItMatters })) },
    { label: "Biggest unresolved question", cells: analysis.places.map((place) => ({ value: place.biggestQuestion.value, evidence: place.biggestQuestion.evidence, note: place.biggestQuestion.whyItMatters })) },
  ], []);

  return (
    <><AppHeader screen="compare" /><main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><button type="button" onClick={onBack} className="mb-5 text-sm font-semibold text-teal-900 hover:underline">← Edit shortlist</button><p className="text-sm font-semibold text-teal-900">Sample comparison</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">The same questions, for every place.</h1><p className="mt-3 max-w-2xl leading-7 text-stone-600">Qualification comes first. Unknown information stays visible instead of being treated as a favorable answer.</p></div><div className="flex flex-wrap gap-2"><EvidenceBadge evidence="confirmed" /><EvidenceBadge evidence="inferred" /><EvidenceBadge evidence="unknown" /></div></div>
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead><tr className="border-b border-stone-200 bg-stone-50"><th className="sticky left-0 z-20 w-48 bg-stone-50 p-5 text-sm font-semibold text-stone-600">Compare</th>{analysis.places.map((place, index) => <th className="w-[30%] p-5 align-top" key={place.id}><p className="text-lg font-semibold">{String.fromCharCode(65 + index)}. {place.nickname}</p><button onClick={() => onOpen(index)} className="mt-3 text-sm font-semibold text-teal-900 hover:underline" type="button">Open decision plan →</button></th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr className={`border-b border-stone-200 last:border-0 ${row.emphasis ? "bg-teal-50/50" : ""}`} key={row.label}><th scope="row" className={`sticky left-0 z-10 p-5 align-top text-sm font-semibold ${row.emphasis ? "bg-teal-50 text-teal-950" : "bg-white text-stone-700"}`}>{row.label}</th>{row.cells.map((cell, index) => <td className="border-l border-stone-200 p-5 align-top" key={`${row.label}-${analysis.places[index].id}`}><ClaimCell {...cell} /></td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-semibold text-amber-900">Hidden clause surfaced</p><p className="mt-2 leading-7 text-amber-950">Fulton’s listing says “utilities included,” but its lease excerpt bills electricity separately and makes each tenant responsible for a co-tenant’s unpaid balances. Stateside keeps that contradiction in the comparison instead of silently choosing the cheaper interpretation.</p></div>
      <Disclaimer />
    </main></>
  );
}

function DetailScreen({ selected, onSelect, onBack }: { selected: number; onSelect: (index: number) => void; onBack: () => void }) {
  const place = analysis.places[selected];
  const monthly = computeMonthlyTotal(place);
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => { await navigator.clipboard.writeText(`Subject: ${place.draftEmail.subject}\n\n${place.draftEmail.body}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const laneClass = place.actionLane === "Pause — do not pay yet" ? "border-red-200 bg-red-50 text-red-800" : place.actionLane === "Set aside" ? "border-stone-300 bg-stone-100 text-stone-800" : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <><AppHeader screen="detail" /><main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <button type="button" onClick={onBack} className="mb-6 text-sm font-semibold text-teal-900 hover:underline">← Back to comparison</button>
      <div className="mb-8 flex flex-wrap gap-2" aria-label="Choose a place">{analysis.places.map((item, index) => <button key={item.id} type="button" onClick={() => onSelect(index)} aria-pressed={selected === index} className={`rounded-md border px-4 py-2 text-sm font-semibold ${selected === index ? "border-teal-900 bg-teal-900 text-white" : "border-stone-200 bg-white text-stone-600"}`}>{String.fromCharCode(65 + index)}. {item.nickname}</button>)}</div>
      <Card className="overflow-hidden"><div className="grid gap-6 border-b border-stone-200 p-6 sm:p-8 lg:grid-cols-[1fr_auto]"><div><p className="text-sm font-semibold text-teal-900">Decision plan</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{place.nickname}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">{place.headline.value}</p></div><div className="min-w-44 rounded-lg bg-teal-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-teal-900">Normalized monthly</p><p className="mt-2 text-3xl font-semibold text-teal-950">{monthly.label}</p><p className="mt-2 text-xs text-stone-500">Calculated from stated amounts</p></div></div><div className={`border-b p-5 sm:px-8 ${laneClass}`}><p className="text-xs font-semibold uppercase tracking-wide">Action lane</p><p className="mt-1 text-xl font-semibold">{place.actionLane}</p></div></Card>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">{sectionNames.map(([key, name]) => <Card className={key === "trustVerification" ? "p-6 lg:col-span-2" : "p-6"} key={key}><h2 className="text-xl font-semibold">{name}</h2><div className="mt-5 space-y-5">{place.sections[key].map((claim, index) => <div className="border-t border-stone-200 pt-4 first:border-0 first:pt-0" key={`${key}-${index}`}><div className="flex flex-wrap items-start justify-between gap-3"><p className="max-w-2xl font-medium leading-6">{claim.value}</p><EvidenceBadge evidence={claim.evidence} /></div><p className="mt-2 text-sm leading-6 text-stone-500"><span className="font-semibold text-stone-700">Why this matters to you:</span> {claim.whyItMatters}</p></div>)}</div></Card>)}</div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3"><Card className="p-6"><p className="text-sm font-semibold text-teal-900">Top 3 next actions</p><ol className="mt-5 space-y-4">{place.nextActions.map((action, index) => <li className="flex gap-3" key={index}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-teal-50 text-sm font-semibold text-teal-900">{index + 1}</span><p className="text-sm leading-6">{action.split(/(?<=\.)\s/)[0]}</p></li>)}</ol></Card><Card className="p-6"><p className="text-sm font-semibold text-teal-900">Document checklist</p><ul className="mt-5 space-y-3">{place.documents.map((document) => <li className="flex gap-3 text-sm leading-6" key={document}><span aria-hidden="true" className="text-teal-800">□</span>{document}</li>)}</ul></Card><Card className="p-6"><p className="text-sm font-semibold text-teal-900">Ask the landlord</p><ul className="mt-5 space-y-3">{place.landlordQuestions.slice(0, 6).map((question) => <li className="border-t border-stone-200 pt-3 text-sm leading-6 first:border-0 first:pt-0" key={question}>{question}</li>)}</ul></Card></div>

      <Card className="mt-5 p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold text-teal-900">Generated inquiry email</p><h2 className="mt-1 text-xl font-semibold">Ready to review and copy</h2></div><Button variant="secondary" onClick={copyEmail}>{copied ? "Copied" : "Copy email"}</Button></div><div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-5"><p className="font-semibold">Subject: {place.draftEmail.subject}</p><p className="mt-4 whitespace-pre-line text-sm leading-7 text-stone-700">{place.draftEmail.body}</p></div></Card>
      <Disclaimer />
    </main></>
  );
}

function Disclaimer() {
  return <p className="mx-auto mt-10 max-w-4xl border-t border-stone-200 pt-6 text-center text-xs leading-5 text-stone-500">Stateside does not determine whether a home or neighborhood is safe. It helps students review available evidence, understand uncertainties, and prepare appropriate questions before committing.</p>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("state");
    if (state !== "loading" && state !== "error" && state !== "malformed") return;
    const timer = window.setTimeout(() => setScreen(state), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const compare = () => {
    setScreen("loading");
    window.setTimeout(() => {
      try { validateAnalysis(analysis); setScreen("compare"); }
      catch { setScreen("malformed"); }
    }, 700);
  };

  if (screen === "loading") return <LoadingScreen />;
  if (screen === "error" || screen === "malformed") return <StateScreen malformed={screen === "malformed"} onReset={() => setScreen("setup")} />;
  if (screen === "compare") return <CompareScreen onBack={() => setScreen("setup")} onOpen={(index) => { setSelected(index); setScreen("detail"); }} />;
  if (screen === "detail") return <DetailScreen selected={selected} onSelect={setSelected} onBack={() => setScreen("compare")} />;
  return <SetupScreen onCompare={compare} />;
}
