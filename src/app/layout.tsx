import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai.jaseir.com"),

  title: {
    default: "AI SEO Planner | Website SEO & Growth Strategy | Jaseir",
    template: "%s | Jaseir AI",
  },

  description:
    "AI SEO Planner analyzes your website's SEO, UX, accessibility, performance, mobile experience, and conversion signals to create actionable recommendations and a 30-day growth plan.",

  applicationName: "Jaseir AI SEO Planner",

  alternates: {
    canonical: "/ai-planner/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: "https://ai.jaseir.com/ai-planner/",
    title: "AI SEO Planner | Website SEO & Growth Strategy",
    description:
      "Analyze your website with AI and turn SEO, UX, performance, accessibility, mobile, and conversion signals into a prioritized growth plan.",
    siteName: "Jaseir AI",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "AI SEO Planner | Jaseir",
    description:
      "Use AI to analyze your website and create a prioritized SEO and growth plan.",
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

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}