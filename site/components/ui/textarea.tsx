import { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-3 text-sm leading-6 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-teal-800 focus:ring-2 focus:ring-teal-100 ${className}`} {...props} />;
}
