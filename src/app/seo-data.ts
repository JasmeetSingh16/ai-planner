/* ------------------------------------------------------------------ */
/* Types for the audit API, sample URLs, and the illustrative report   */
/* shown in the hero and the empty state. The example site is          */
/* fictional; its numbers are typical of a real audit.                 */
/* ------------------------------------------------------------------ */

export type ScoreData = {
  seo: number;
  ux: number;
  accessibility: number;
  performance: number;
  mobile: number;
  conversion: number;
};

export type CriticalIssue = {
  title: string;
  description: string;
  impact: string;
};

export type Recommendation = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
};

export type ImprovementWeek = {
  week: string;
  focus: string;
  actions: string[];
};

export type PageSpeedVital = {
  id: string;
  title: string;
  displayValue: string;
  score: number | null;
};

export type PageSpeedStrategy = {
  strategy: "mobile" | "desktop";
  performance: number | null;
  accessibility: number | null;
  seo: number | null;
  bestPractices: number | null;
  vitals: PageSpeedVital[];
  fieldCategory: string | null;
};

export type AuditData = {
  overallScore: number;
  scores: ScoreData;
  summary: string;
  criticalIssues: CriticalIssue[];
  recommendations: Recommendation[];
  improvementPlan: ImprovementWeek[];
  pageSpeed?: {
    available: boolean;
    error: string | null;
    mobile: PageSpeedStrategy | null;
    desktop: PageSpeedStrategy | null;
  };
  disclaimer?: string;
};

export type WebsiteData = {
  url: string;
  title: string;
  description: string;
};

export type AuditResponse = {
  success: boolean;
  website?: WebsiteData;
  audit?: AuditData;
  error?: string;
};

export const categoryLabels: { key: keyof ScoreData; label: string; short: string }[] = [
  { key: "seo", label: "SEO", short: "SEO" },
  { key: "performance", label: "Performance", short: "Speed" },
  { key: "mobile", label: "Mobile", short: "Mobile" },
  { key: "accessibility", label: "Accessibility", short: "A11y" },
  { key: "ux", label: "User experience", short: "UX" },
  { key: "conversion", label: "Conversion", short: "Conversion" },
];

/** Public sites that audit quickly — cycled by "Try sample data". */
export const sampleSites = ["https://www.wikipedia.org", "https://www.jaseir.com", "https://nextjs.org"];

export const exampleAudit: Required<Pick<AuditResponse, "website" | "audit">> = {
  website: {
    url: "https://www.northwind-dental.example/",
    title: "Northwind Dental — Family & Cosmetic Dentistry",
    description: "Six clinics, same-week appointments.",
  },
  audit: {
    overallScore: 72,
    scores: { seo: 84, ux: 78, accessibility: 81, performance: 46, mobile: 58, conversion: 71 },
    summary:
      "Solid on-page SEO and clear service pages, held back by a slow mobile experience. Large hero images and render-blocking scripts push Largest Contentful Paint past 4 seconds, and the booking button sits below the fold on phones.",
    criticalIssues: [
      {
        title: "Slow Largest Contentful Paint on mobile",
        description: "The hero image is 1.8 MB and loads before any text, so LCP reaches 4.6 s on a mid-range phone.",
        impact: "Slow first impressions increase bounce rate and weaken Core Web Vitals rankings.",
      },
      {
        title: "Booking button below the fold on phones",
        description: "On a 375 px screen the primary 'Book now' button only appears after two scrolls.",
        impact: "Fewer mobile visitors reach the booking flow.",
      },
      {
        title: "Service pages share one meta description",
        description: "All 14 treatment pages reuse the home page description.",
        impact: "Search results show generic snippets, lowering click-through.",
      },
    ],
    recommendations: [
      { title: "Compress and resize hero images", description: "Serve WebP at 1200 px wide and preload the hero image.", priority: "High" },
      { title: "Move the booking button above the fold", description: "Add a sticky 'Book now' bar on mobile.", priority: "High" },
      { title: "Write unique meta descriptions", description: "One per treatment page, with location and price cues.", priority: "Medium" },
      { title: "Label the contact form fields", description: "Two inputs rely on placeholder text only.", priority: "Medium" },
      { title: "Add FAQ schema to treatment pages", description: "Improves eligibility for rich results and AI answers.", priority: "Low" },
    ],
    improvementPlan: [
      { week: "Week 1", focus: "Speed quick wins", actions: ["Compress hero images", "Defer chat widget script"] },
      { week: "Week 2", focus: "Mobile conversion", actions: ["Sticky booking bar", "Shorten the booking form"] },
      { week: "Week 3", focus: "On-page SEO", actions: ["Unique meta descriptions", "Fix duplicate H1s"] },
      { week: "Week 4", focus: "Measure & iterate", actions: ["Re-run the audit", "Compare Search Console CTR"] },
    ],
    pageSpeed: {
      available: true,
      error: null,
      mobile: {
        strategy: "mobile",
        performance: 46,
        accessibility: 81,
        seo: 92,
        bestPractices: 96,
        fieldCategory: null,
        vitals: [
          { id: "largest-contentful-paint", title: "Largest Contentful Paint", displayValue: "4.6 s", score: 28 },
          { id: "first-contentful-paint", title: "First Contentful Paint", displayValue: "2.4 s", score: 70 },
          { id: "cumulative-layout-shift", title: "Cumulative Layout Shift", displayValue: "0.04", score: 99 },
          { id: "total-blocking-time", title: "Total Blocking Time", displayValue: "610 ms", score: 41 },
        ],
      },
      desktop: {
        strategy: "desktop",
        performance: 78,
        accessibility: 81,
        seo: 92,
        bestPractices: 96,
        fieldCategory: null,
        vitals: [
          { id: "largest-contentful-paint", title: "Largest Contentful Paint", displayValue: "1.9 s", score: 82 },
          { id: "first-contentful-paint", title: "First Contentful Paint", displayValue: "0.7 s", score: 97 },
          { id: "cumulative-layout-shift", title: "Cumulative Layout Shift", displayValue: "0.01", score: 100 },
          { id: "total-blocking-time", title: "Total Blocking Time", displayValue: "180 ms", score: 88 },
        ],
      },
    },
  },
};
