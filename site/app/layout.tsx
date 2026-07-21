import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Stateside — Compare your U.S. housing shortlist",
  description: "A calm, evidence-labeled housing comparison for international students deciding what to verify before applying, paying, or signing.",
  openGraph: {
    title: "Stateside — Understand before you commit",
    description: "Compare three U.S. rentals with qualification first and unknowns kept visible.",
    images: [{ url: "/og.png", width: 1733, height: 907, alt: "Stateside housing comparison preview" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={plex.variable}>{children}</body></html>;
}
