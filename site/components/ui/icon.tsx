import { SVGAttributes } from "react";

export type IconName = "status" | "qualification" | "rent" | "recurring" | "fees" | "cash" | "calendar" | "rest" | "transit" | "question" | "building" | "camera" | "location" | "duplicate" | "price" | "stale" | "document" | "email" | "actions" | "verification";

export function Icon({ name, className = "", ...props }: SVGAttributes<SVGElement> & { name: IconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, React.ReactNode> = {
    status: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4m0 4h.01" /></>,
    qualification: <><circle cx="9" cy="8" r="3" /><path d="M4 18c.8-3 2.5-4.5 5-4.5S13.2 15 14 18m2-9 1.5 1.5L21 7" /></>,
    rent: <><circle cx="12" cy="12" r="8" /><path d="M14.5 8.5c-.7-.6-1.5-.9-2.5-.9-1.4 0-2.5.8-2.5 2s1 1.7 2.7 2.1c1.6.4 2.3 1 2.3 2.1 0 1.3-1.1 2.2-2.7 2.2-1.1 0-2.1-.4-2.9-1.1M12 6v12" /></>,
    recurring: <><path d="M7 7h10v10H7z" /><path d="M9 4h6M9 20h6M4 9v6m16-6v6" /></>,
    fees: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6m-6 4h6m-6 4h3" /></>,
    cash: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 12h.01M17 12h.01" /><circle cx="12" cy="12" r="2" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4m8-4v4M4 10h16" /></>,
    rest: <><path d="M4 18v-8m16 8v-5a3 3 0 0 0-3-3H8V7H4v11m0-2h16" /></>,
    transit: <><rect x="5" y="3" width="14" height="16" rx="3" /><path d="M8 19v2m8-2v2M8 7h8M8 14h.01M16 14h.01" /></>,
    question: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 0 1 4.6 1c0 2-2.4 2.1-2.4 4m0 3h.01" /></>,
    building: <><path d="M5 21V4h10v17M15 9h4v12M8 8h2m-2 4h2m-2 4h2m5-3h2m-2 4h2M3 21h18" /></>,
    camera: <><path d="M4 7h4l1.5-2h5L16 7h4v12H4z" /><circle cx="12" cy="13" r="3" /></>,
    location: <><path d="M12 21s6-5 6-11a6 6 0 1 0-12 0c0 6 6 11 6 11z" /><circle cx="12" cy="10" r="2" /></>,
    duplicate: <><rect x="7" y="7" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    price: <><path d="M4 5h11l5 5-10 10-6-6V5z" /><circle cx="8.5" cy="9.5" r="1" /></>,
    stale: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    document: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6m-6 4h6" /></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    actions: <><path d="M5 7h14M5 12h9M5 17h6" /><path d="m16 15 3 2-3 2" /></>,
    verification: <><path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3z" /><path d="m9 12 2 2 4-4" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-5 w-5 shrink-0 ${className}`} {...common} {...props}>{paths[name]}</svg>;
}
