// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

/* ------------------------------------------------------------------ */
/* SITE LINKS — shared by the header and footer of every Jaseir app.   */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import type { Agent, AgentSlug } from "./agents";

export const AI_ORIGIN = "https://ai.jaseir.com";
export const MAIN_SITE_URL = "https://www.jaseir.com/";
export const CONTACT_URL = "https://www.jaseir.com/contact/";
export const ABOUT_URL = "https://www.jaseir.com/about/";
export const SERVICES_URL = "https://www.jaseir.com/services/";
export const LOGO_URL = `${AI_ORIGIN}/logo.webp`;
export const LOGO_LIGHT_URL = `${AI_ORIGIN}/logo-light.webp`;

export const SITE_NAME = "Jaseir AI";
export const SITE_DESCRIPTION =
  "Practical AI agents from Jaseir Technologies — lead scoring, SEO planning, content strategy, conversion audits, competitor research, booking and RAG assistants you can try right now.";

/**
 * Which app is rendering the header/footer.
 * - hub:   the dashboard app (home page, RAG pages, privacy)
 * - agent: one of the separately deployed agent apps
 */
export type SiteZone = { kind: "hub" } | { kind: "agent"; slug: AgentSlug };

/**
 * Link to a page served by the dashboard app.
 * Inside the hub a relative link keeps navigation client-side; from an
 * agent app it has to be absolute because it is a different deployment.
 * `onHome` turns "/#section" into "#section" so it scrolls in place.
 */
export function hubHref(zone: SiteZone, path: string, onHome = false): string {
  if (zone.kind === "hub") {
    if (onHome && path.startsWith("/#")) return path.slice(1);
    return path;
  }
  return `${AI_ORIGIN}${path}`;
}

/** Link to an agent page, relative when it lives in the current app. */
export function agentHref(zone: SiteZone, agent: Agent): string {
  if (zone.kind === "hub" && agent.host === "hub") return agent.path;
  return `${AI_ORIGIN}${agent.path}`;
}

export const serviceLinks = [
  { label: "AI Automation & Agents", href: SERVICES_URL },
  { label: "SEO & AI Search Visibility", href: "https://www.jaseir.com/ai-seo-services-in-india/" },
  { label: "CRM & Workflow Automation", href: "https://www.jaseir.com/crm-support/" },
  { label: "Web Development & Ecommerce", href: "https://www.jaseir.com/e-commerce-website-development/" },
];

export const companyLinks = [
  { label: "About Jaseir", href: ABOUT_URL },
  { label: "Contact", href: CONTACT_URL },
  { label: "Case studies", href: "https://www.jaseir.com/case-studies/" },
  { label: "jaseir.com", href: MAIN_SITE_URL },
];
