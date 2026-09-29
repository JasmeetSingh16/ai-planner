// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

/* ------------------------------------------------------------------ */
/* AGENT REGISTRY — the single source of truth for every Jaseir agent. */
/* Header mega-menu, footer, home page agent cards and every agent     */
/* page read from this file.                                           */
/*                                                                     */
/* SOURCE OF TRUTH: this file lives in dashboard/ and is copied into   */
/* the agent apps by `node scripts/sync-shared.mjs`. Edit it here.     */
/*                                                                     */
/* Keep this file plain data (no JSX, no enums): the sync script also  */
/* imports it with Node to build the Flask booking agent's header.     */
/* ------------------------------------------------------------------ */

export type AgentSlug =
  | "lead-qualification"
  | "seo-planner"
  | "content-planner"
  | "conversion-friction"
  | "competitor-comparison"
  | "booking-agent"
  | "rag-assistant";

export type AgentIconName =
  | "lead"
  | "seo"
  | "content"
  | "conversion"
  | "competitor"
  | "booking"
  | "rag";

export type AgentPalette = {
  /** Buttons, links, key numbers on white. White text on it passes AA. */
  accent: string;
  /** Darkest shade — text on the soft tint. */
  ink: string;
  /** Lighter shade for use on dark backgrounds. */
  bright: string;
  /** Very light tint for chips, badges and hover fills. */
  soft: string;
  /** Border colour that pairs with `soft`. */
  line: string;
  /** Two-stop gradient, used sparingly (icon badges, gauges). */
  from: string;
  to: string;
};

export type Agent = {
  slug: AgentSlug;
  /** Full product name, e.g. "AI Lead Qualification". */
  name: string;
  /** Short name for tight spaces, e.g. "Lead Qualification". */
  shortName: string;
  /** Uppercase category label. */
  category: string;
  /** One line, outcome-first. Used in menus and cards. */
  tagline: string;
  icon: AgentIconName;
  /** Path on ai.jaseir.com. Matches the live URL (some apps drop the trailing slash). */
  path: string;
  /** "hub" = served by the dashboard app itself, "zone" = a separate app. */
  host: "hub" | "zone";
  palette: AgentPalette;
  seo: { title: string; description: string };
  /** Three agents shown in the "related" strip on this agent's page. */
  related: [AgentSlug, AgentSlug, AgentSlug];
};

export const agents: Agent[] = [
  {
    slug: "lead-qualification",
    name: "AI Lead Qualification",
    shortName: "Lead Qualification",
    category: "Lead intelligence",
    tagline: "Score any lead out of 100, with the evidence behind every point.",
    icon: "lead",
    path: "/ai-lead-qualification/",
    host: "zone",
    palette: {
      accent: "#047857",
      ink: "#064e3b",
      bright: "#34d399",
      soft: "#ecfdf5",
      line: "#a7f3d0",
      from: "#059669",
      to: "#0d9488",
    },
    seo: {
      title: "AI Lead Qualification — Score Leads in Seconds",
      description:
        "Score inbound leads out of 100 across fit, need, budget, timeline, authority and intent. See the evidence, the next best action and a ready-to-send reply.",
    },
    related: ["booking-agent", "conversion-friction", "competitor-comparison"],
  },
  {
    slug: "seo-planner",
    name: "AI SEO Planner",
    shortName: "SEO Planner",
    category: "Search intelligence",
    tagline: "Audit a site and get a prioritised SEO and AI-search plan.",
    icon: "seo",
    path: "/ai-planner",
    host: "zone",
    palette: {
      accent: "#4338ca",
      ink: "#312e81",
      bright: "#818cf8",
      soft: "#eef2ff",
      line: "#c7d2fe",
      from: "#2563eb",
      to: "#4f46e5",
    },
    seo: {
      title: "AI SEO Planner — Website SEO & Growth Plan",
      description:
        "Audit technical SEO, content, UX, speed and AI-search visibility, then get a prioritised plan of what to fix first.",
    },
    related: ["content-planner", "competitor-comparison", "conversion-friction"],
  },
  {
    slug: "content-planner",
    name: "AI Content Planner",
    shortName: "Content Planner",
    category: "Content operations",
    tagline: "Turn one business idea into a complete content strategy.",
    icon: "content",
    path: "/ai-content-planner/",
    host: "zone",
    palette: {
      accent: "#be185d",
      ink: "#831843",
      bright: "#f472b6",
      soft: "#fdf2f8",
      line: "#fbcfe8",
      from: "#db2777",
      to: "#c026d3",
    },
    seo: {
      title: "AI Content Planner — Content Strategy in Minutes",
      description:
        "Describe your business and get audiences, content pillars, topic ideas and a publishing plan you can hand straight to your team.",
    },
    related: ["seo-planner", "competitor-comparison", "rag-assistant"],
  },
  {
    slug: "conversion-friction",
    name: "AI Conversion Friction Analyzer",
    shortName: "Conversion Friction",
    category: "Conversion optimisation",
    tagline: "Find what stops visitors converting, ranked by revenue impact.",
    icon: "conversion",
    path: "/conversion-friction-analyzer",
    host: "zone",
    palette: {
      accent: "#c2410c",
      ink: "#7c2d12",
      bright: "#fb923c",
      soft: "#fff7ed",
      line: "#fed7aa",
      from: "#ea580c",
      to: "#f59e0b",
    },
    seo: {
      title: "Conversion Friction Analyzer — AI CRO Audit",
      description:
        "Analyse a landing page for the friction that costs you sign-ups and sales, with fixes ranked by likely revenue impact.",
    },
    related: ["seo-planner", "lead-qualification", "competitor-comparison"],
  },
  {
    slug: "competitor-comparison",
    name: "AI Competitor Comparison",
    shortName: "Competitor Comparison",
    category: "Competitive intelligence",
    tagline: "See where you win and lose against any competitor.",
    icon: "competitor",
    path: "/ai-competitor-comparison/",
    host: "zone",
    palette: {
      accent: "#be123c",
      ink: "#881337",
      bright: "#fb7185",
      soft: "#fff1f2",
      line: "#fecdd3",
      from: "#dc2626",
      to: "#e11d48",
    },
    seo: {
      title: "AI Competitor Comparison — Find Your Edge",
      description:
        "Compare your business with a competitor on positioning, offers, content and search visibility, and see the gaps you can win.",
    },
    related: ["seo-planner", "content-planner", "conversion-friction"],
  },
  {
    slug: "booking-agent",
    name: "AI Booking Agent",
    shortName: "Booking Agent",
    category: "Booking automation",
    tagline: "Chat with visitors and book them into a free slot, 24/7.",
    icon: "booking",
    path: "/ai-booking-agent/",
    host: "zone",
    palette: {
      accent: "#0e7490",
      ink: "#164e63",
      bright: "#22d3ee",
      soft: "#ecfeff",
      line: "#a5f3fc",
      from: "#0891b2",
      to: "#0284c7",
    },
    seo: {
      title: "AI Booking Agent — Book Consultations 24/7",
      description:
        "An AI scheduling assistant that answers visitor questions, shows open slots and confirms bookings while capturing the lead.",
    },
    related: ["lead-qualification", "rag-assistant", "conversion-friction"],
  },
  {
    slug: "rag-assistant",
    name: "RAG Knowledge Assistant",
    shortName: "RAG Knowledge Assistant",
    category: "Knowledge AI",
    tagline: "Answers from your own documents, with the source for every reply.",
    icon: "rag",
    path: "/rag-knowledge-assistant/",
    host: "hub",
    palette: {
      accent: "#6d28d9",
      ink: "#4c1d95",
      bright: "#a78bfa",
      soft: "#f5f3ff",
      line: "#ddd6fe",
      from: "#7c3aed",
      to: "#9333ea",
    },
    seo: {
      title: "RAG Chatbot & RAG Development Services",
      description:
        "A RAG assistant that answers from your PDFs, docs, website and SOPs, and cites the source for every answer.",
    },
    related: ["booking-agent", "lead-qualification", "content-planner"],
  },
];

export function getAgent(slug: AgentSlug): Agent {
  const agent = agents.find((a) => a.slug === slug);
  if (!agent) throw new Error(`Unknown agent: ${slug}`);
  return agent;
}

export function getRelatedAgents(slug: AgentSlug): Agent[] {
  return getAgent(slug).related.map(getAgent);
}

function hexToRgb(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/**
 * CSS custom properties for an agent's accent. Spread onto any wrapper's
 * `style` and every child component picks the colour up automatically.
 */
export function agentVars(agent: Agent): Record<string, string> {
  const p = agent.palette;
  return {
    "--agent-accent": p.accent,
    "--agent-accent-rgb": hexToRgb(p.accent),
    "--agent-accent-ink": p.ink,
    "--agent-accent-bright": p.bright,
    "--agent-accent-bright-rgb": hexToRgb(p.bright),
    "--agent-accent-soft": p.soft,
    "--agent-accent-line": p.line,
    "--agent-gradient": `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)`,
  };
}
