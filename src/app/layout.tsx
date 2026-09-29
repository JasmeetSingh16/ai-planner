import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/jaseir-kit.css";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import { agentMetadata } from "../lib/agent-metadata";
import type { SiteZone } from "../lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  ...agentMetadata("seo-planner"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "AI SEO planner",
    "AI SEO analysis",
    "website SEO audit",
    "SEO website analyzer",
    "AI website audit",
    "technical SEO analysis",
    "website growth plan",
    "SEO recommendations",
    "PageSpeed analysis",
  ],
};

const zone: SiteZone = { kind: "agent", slug: "seo-planner" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader zone={zone} />
        {children}
        <SiteFooter
          zone={zone}
          cta={{
            title: "Want the fixes done, not just listed?",
            text: "Our team turns the audit into shipped work — speed, technical SEO, content and AI-search visibility — and re-runs it to prove the gains.",
          }}
        />
      </body>
    </html>
  );
}
