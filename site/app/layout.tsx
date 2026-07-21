import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stateside-student-housing.summerchang.chatgpt.site"),
  title: { default: "Stateside — Understand a U.S. rental before you commit", template: "%s · Stateside" },
  description: "Compare U.S. rentals by qualification, true cost, lease fit, rest, location, and missing evidence—built for international students.",
  applicationName: "Stateside",
  keywords: ["international student housing", "rental comparison", "student housing USA", "UC Berkeley housing", "lease review", "rental qualification"],
  authors: [{ name: "Stateside" }],
  creator: "Stateside",
  alternates: { canonical: "/" },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], shortcut: "/favicon.svg" },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: {
    title: "Stateside — Understand before you commit",
    description: "A research-backed rental comparison for international students—with qualification first and unknowns kept visible.",
    url: "/",
    siteName: "Stateside",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og.png", width: 1733, height: 907, alt: "Stateside housing comparison preview" }],
  },
  twitter: { card: "summary_large_image", title: "Stateside — Understand before you commit", description: "Compare U.S. rentals with qualification first and unknowns kept visible.", images: ["/og.png"] },
};

export const viewport: Viewport = { themeColor: "#134e4a", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={plex.variable}>{children}</body></html>;
}
