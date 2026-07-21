export type Evidence = "confirmed" | "inferred" | "unknown";
export type Claim = { value: string; evidence: Evidence; whyItMatters: string };
export type MoneyFact = { amount: number | null; evidence: Evidence; note: string };
export type CostItem = MoneyFact & { label: string; frequency: "monthly" | "one_time" | "unknown" };

export type PlaceAnalysis = {
  id: string;
  nickname: string;
  headline: Claim;
  qualification: { summary: Claim; route: string; missingEvidence: string[] };
  financials: { monthlyRent: MoneyFact; recurring: CostItem[]; fees: CostItem[]; deposit: MoneyFact; publishedMoveIn: MoneyFact };
  lease: { start: string | null; end: string | null; termMonths: number | null; summary: Claim };
  restPrivacy: Claim;
  campusEvening: Claim;
  biggestQuestion: Claim;
  sections: { restPrivacy: Claim[]; dailyLife: Claim[]; totalCommitment: Claim[]; rentalReadiness: Claim[]; trustVerification: Claim[] };
  actionLane: "Ready to contact" | "Verify before applying" | "Pause — do not pay yet" | "Set aside";
  nextActions: string[];
  documents: string[];
  landlordQuestions: string[];
  draftEmail: { subject: string; body: string };
};

export type Analysis = { places: PlaceAnalysis[] };

const evidenceRank: Record<Evidence, number> = { confirmed: 0, inferred: 1, unknown: 2 };

export function formatMoney(amount: number | null) {
  return amount === null ? "Amount unknown" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export function evidenceForCosts(items: { amount: number | null; evidence: Evidence }[]): Evidence {
  if (!items.length) return "unknown";
  return items.reduce<Evidence>((worst, item) => item.amount === null ? "unknown" : evidenceRank[item.evidence] > evidenceRank[worst] ? item.evidence : worst, "confirmed");
}

export function computeMonthlyTotal(place: PlaceAnalysis) {
  const monthly = place.financials.recurring.filter((item) => item.frequency === "monthly" && !/optional/i.test(item.label));
  const known = [place.financials.monthlyRent, ...monthly].reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const evidence = evidenceForCosts([place.financials.monthlyRent, ...monthly]);
  return { amount: known, evidence, label: evidence === "unknown" ? `${formatMoney(known)} + unknown costs` : `${formatMoney(known)} / month` };
}

export function computeMoveInCash(place: PlaceAnalysis) {
  const moveIn = place.financials.publishedMoveIn;
  if (moveIn.amount === null) return { amount: null, evidence: "unknown" as Evidence, label: "Uncomputable" };
  return { amount: moveIn.amount, evidence: moveIn.evidence, label: moveIn.evidence === "unknown" ? `${formatMoney(moveIn.amount)} — unverified` : formatMoney(moveIn.amount) };
}

function utcDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function computeLeaseFit(place: PlaceAnalysis, programMonths: number, programStart: string, programEnd: string) {
  if (place.lease.termMonths !== null) {
    const extraMonths = Math.max(0, place.lease.termMonths - programMonths);
    if (extraMonths > 0) {
      const extraRent = (place.financials.monthlyRent.amount ?? 0) * extraMonths;
      return `${place.lease.termMonths}-month lease extends ${extraMonths} months beyond the ${programMonths}-month program (${formatMoney(extraRent)} in additional rent). Subletting and early termination are not published.`;
    }
  }
  const { start, end } = place.lease;
  if (!start || !end) return "Lease dates are still unclear";
  const day = 86_400_000;
  const startGap = Math.round((utcDate(start) - utcDate(programStart)) / day);
  const endGap = Math.round((utcDate(end) - utcDate(programEnd)) / day);
  const beginning = startGap > 0 ? `starts ${startGap} days after the program` : startGap < 0 ? `starts ${Math.abs(startGap)} days before the program` : "starts with the program";
  const ending = endGap > 0 ? `ends about ${Math.max(1, Math.round(endGap / 30))} extra months after it` : endGap < 0 ? `ends ${Math.abs(endGap)} days before it` : "ends with the program";
  return `Lease ${beginning} and ${ending}.`;
}

export function validateAnalysis(value: unknown): asserts value is Analysis {
  if (!value || typeof value !== "object" || !("places" in value) || !Array.isArray((value as Analysis).places) || (value as Analysis).places.length !== 3) throw new Error("Expected three places");
  for (const place of (value as Analysis).places) {
    if (!place.id || !place.nickname || !place.headline?.evidence || !place.qualification?.summary?.evidence || !place.actionLane || place.nextActions?.length !== 3) throw new Error("Malformed place analysis");
  }
}
