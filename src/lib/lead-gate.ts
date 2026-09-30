// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

/* ------------------------------------------------------------------ */
/* REPORT LEAD GATE — shared by the agent apps (client + API route)    */
/* and the dashboard's /api/agent-leads/ endpoint.                     */
/* No Node or browser APIs here, so it's safe to import anywhere.      */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import type { AgentSlug } from "./agents";

/** Agents whose full report sits behind the email form. */
export const GATED_AGENTS = [
  "seo-planner",
  "content-planner",
  "conversion-friction",
  "competitor-comparison",
  "lead-qualification",
] as const satisfies readonly AgentSlug[];

export type GatedAgent = (typeof GATED_AGENTS)[number];

export const isGatedAgent = (value: unknown): value is GatedAgent =>
  GATED_AGENTS.some((slug) => slug === value);

/**
 * Sent next to a gated (preview-only) report.
 * - token: the full report, encrypted by the agent's API route. The
 *   dashboard decrypts it once the visitor submits the form.
 * - token null: sealing isn't configured, so the full report is already
 *   in the response and the page only blurs it (client-side gate).
 */
export type ReportGateInfo = { token: string | null };

/** Same-origin endpoint served by the dashboard app. */
export const AGENT_LEADS_API = process.env.NEXT_PUBLIC_AGENT_LEADS_API || "/api/agent-leads/";

export const gateCopy = {
  title: "Get your full report",
  fields: { name: "Name", email: "Email", website: "Company website" },
  placeholders: { name: "Your name", email: "you@company.com", website: "company.com" },
  optional: "optional",
  submit: "Unlock full report",
  sending: "Unlocking…",
  unlocking: "Unlocking your full report…",
  consent: "We'll use your email to send occasional AI tips and follow up about your report. No spam.",
  privacyLabel: "Privacy policy",
  error: "Sorry, something went wrong. Please try again in a moment.",
  expired: "This report has expired. Please run the agent again to get a fresh one.",
  rateLimited: "Too many requests from your network. Please try again in an hour.",
  ctaTitle: "Want this built and running for your business?",
  ctaButton: "Book a free call",
};

export type GateLeadInput = { name: string; email: string; website: string };
export type GateLeadErrors = Partial<Record<keyof GateLeadInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "company.com" → "https://company.com"; "" stays ""; null if unusable. */
export function normalizeGateWebsite(value: string): string | null {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** Returns an error message per invalid field (empty object = valid). */
export function validateGateLead(input: GateLeadInput): GateLeadErrors {
  const errors: GateLeadErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();

  if (!name) errors.name = "Please enter your name.";
  else if (name.length > 100) errors.name = "Please use at most 100 characters.";

  if (!email) errors.email = "Please enter your email.";
  else if (email.length > 254 || !EMAIL.test(email)) errors.email = "Please enter a valid email, e.g. you@company.com.";

  if (input.website.trim().length > 200 || normalizeGateWebsite(input.website) === null) {
    errors.website = "Please enter a valid website, e.g. company.com.";
  }

  return errors;
}

/** Trims long free text for storage and emails. */
export const clip = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);
