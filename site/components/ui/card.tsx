import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg border border-stone-200 bg-white shadow-sm ${className}`} {...props} />;
}
