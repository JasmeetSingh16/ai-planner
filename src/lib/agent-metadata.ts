// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

/* ------------------------------------------------------------------ */
/* METADATA HELPERS — root-layout metadata for every Jaseir app.       */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import type { Metadata } from "next";
import { getAgent, type AgentSlug } from "./agents";
import { AI_ORIGIN, LOGO_URL, SITE_NAME } from "./site";

const TEMPLATE = `%s | ${SITE_NAME}`;

/** Home page title and description (the hub root layout's defaults). */
export const HUB_TITLE = `AI Agents & Automation for Businesses | ${SITE_NAME}`;
export const HUB_DESCRIPTION =
  "Jaseir builds AI agents that qualify leads, book appointments and answer customers 24/7 from your own documents. See live demos and pricing.";

/** Metadata for the dashboard (hub) root layout. */
export function hubMetadata(): Metadata {
  const url = `${AI_ORIGIN}/`;
  return {
    metadataBase: new URL(AI_ORIGIN),
    title: { default: HUB_TITLE, template: TEMPLATE },
    description: HUB_DESCRIPTION,
    applicationName: SITE_NAME,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Jaseir",
      locale: "en_IN",
      url,
      title: HUB_TITLE,
      description: HUB_DESCRIPTION,
      images: [{ url: LOGO_URL, alt: "Jaseir" }],
    },
    twitter: { card: "summary_large_image", title: HUB_TITLE, description: HUB_DESCRIPTION },
  };
}

/**
 * Metadata for an agent app's root layout. The agent's page lives in the
 * same segment as the layout, so the full title is written out here
 * (a layout's title template only applies to child segments).
 */
export function agentMetadata(slug: AgentSlug): Metadata {
  const agent = getAgent(slug);
  const title = `${agent.seo.title} | ${SITE_NAME}`;
  const url = `${AI_ORIGIN}${agent.path}`;
  return {
    metadataBase: new URL(AI_ORIGIN),
    title: { default: title, template: TEMPLATE },
    description: agent.seo.description,
    applicationName: SITE_NAME,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url,
      title,
      description: agent.seo.description,
      images: [{ url: LOGO_URL, alt: "Jaseir" }],
    },
    twitter: { card: "summary", title, description: agent.seo.description },
  };
}
