import { HTMLAttributes } from "react";

type Tone = "confirmed" | "inferred" | "unknown" | "sample";

export function Badge({ tone, className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { tone: Tone }) {
  const tones: Record<Tone, string> = {
    confirmed: "border-green-200 bg-green-50 text-green-700",
    inferred: "border-amber-200 bg-amber-50 text-amber-700",
    unknown: "border-slate-200 bg-slate-100 text-slate-600",
    sample: "border-teal-200 bg-teal-50 text-teal-900",
  };
  return <span className={`inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`} {...props} />;
}
