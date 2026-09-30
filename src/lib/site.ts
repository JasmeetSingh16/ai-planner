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

/**
 * Where every "book a call" call to action goes (header "Get Started",
 * footer band, agent heroes, RAG pricing and demo buttons, report CTAs).
 * Set BOOKING_LINK below, then run `node scripts/sync-shared.mjs`.
 * The "Contact" nav item keeps pointing to CONTACT_URL.
 */
const BOOKING_LINK = "YOUR_BOOKING_LINK";

/** Our own "Book a free call" form (dashboard /book-a-call/). */
export const BOOK_CALL_PAGE_URL = "https://ai.jaseir.com/book-a-call/";

/** A real calendar link once BOOKING_LINK is set; until then, the /book-a-call/ form. */
export const BOOKING_URL = /^https?:\/\//.test(BOOKING_LINK) ? BOOKING_LINK : BOOK_CALL_PAGE_URL;

/**
 * Google OAuth client ID for "Continue with Google" on the report form
 * (Google Cloud Console → APIs & Services → Credentials → OAuth client ID,
 * type "Web application"). It's public, not a secret. Empty = button hidden.
 */
export const GOOGLE_CLIENT_ID = "823499604328-lp5tgn4bcvluqd80rak0j2hi8ouvnghu.apps.googleusercontent.com";

/** Props for a link to BOOKING_URL — always opens in a new tab. */
export const bookingLinkProps = { href: BOOKING_URL, target: "_blank", rel: "noopener noreferrer" } as const;
export const ABOUT_URL = "https://www.jaseir.com/about/";
export const SERVICES_URL = "https://www.jaseir.com/services/";
/** Transparent logo for light backgrounds (WebP + PNG fallback). */
export const LOGO_PATH = "/logo-transparent.webp";
export const LOGO_PNG_PATH = "/logo-transparent.png";
export const LOGO_URL = `${AI_ORIGIN}${LOGO_PATH}`;
export const LOGO_PNG_URL = `${AI_ORIGIN}${LOGO_PNG_PATH}`;
export const LOGO_LIGHT_URL = `${AI_ORIGIN}/logo-light.webp`;

export const SITE_NAME = "Jaseir AI";

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

/** Logo URLs: same-origin inside the hub, absolute from agent apps. */
export function logoSources(zone: SiteZone) {
  const base = zone.kind === "hub" ? "" : AI_ORIGIN;
  return { webp: `${base}${LOGO_PATH}`, png: `${base}${LOGO_PNG_PATH}` };
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
