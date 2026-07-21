import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary"; size?: "default" | "lg" };

export function Button({ className = "", variant = "primary", size = "default", ...props }: Props) {
  const tone = variant === "primary" ? "border-teal-900 bg-teal-900 text-white hover:bg-teal-950" : "border-stone-300 bg-white text-stone-800 hover:bg-stone-50";
  const sizing = size === "lg" ? "min-h-12 px-6 py-3 text-base" : "min-h-10 px-4 py-2 text-sm";
  return <button className={`inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${tone} ${sizing} ${className}`} {...props} />;
}
