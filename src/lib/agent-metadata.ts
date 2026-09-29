// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

/* ------------------------------------------------------------------ */
/* METADATA HELPERS — root-layout metadata for every Jaseir app.       */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import type { Metadata } from "next";
import { getAgent, type AgentSlug } from "./agents";
import { AI_ORIGIN, LOGO_URL, SITE_DESCRIPTION, SITE_NAME } from "./site";

const TEMPLATE = `%s | ${SITE_NAME}`;

/** Metadata for the dashboard (hub) root layout. */
export function hubMetadata(): Metadata {
  const title = `${SITE_NAME} — AI Agents That Turn Information Into Action`;
  return {
    metadataBase: new URL(AI_ORIGIN),
    title: { default: title, template: TEMPLATE },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url: `${AI_ORIGIN}/`,
      title,
      description: SITE_DESCRIPTION,
      images: [{ url: LOGO_URL, alt: "Jaseir" }],
    },
    twitter: { card: "summary", title, description: SITE_DESCRIPTION },
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
