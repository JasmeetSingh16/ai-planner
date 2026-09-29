// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

/* ------------------------------------------------------------------ */
/* AGENT PAGE TEMPLATE — the sections every agent page is built from.  */
/* No hooks here, so these work in server and client components.       */
/* Colours come from the --agent-* variables set by <AgentPage>.       */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import { ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import AgentIcon from "./AgentIcon";
import { agentVars, getAgent, getRelatedAgents, type AgentSlug } from "../../lib/agents";
import { CONTACT_URL, agentHref, type SiteZone } from "../../lib/site";

export const WORKSPACE_ID = "workspace";

/* ---------------------------------------------------------------- */
/* Page wrapper — sets the accent variables for everything inside.  */
/* ---------------------------------------------------------------- */

export function AgentPage({ slug, children }: { slug: AgentSlug; children: ReactNode }) {
  return (
    <main className="jk-agent" style={agentVars(getAgent(slug))} data-agent={slug}>
      {children}
    </main>
  );
}

/* ---------------------------------------------------------------- */
/* Hero — split layout: copy on the left, a result preview right.   */
/* ---------------------------------------------------------------- */

export type ProofChip = { icon: LucideIcon; label: string };

export function AgentHero({
  slug,
  headline,
  lede,
  chips,
  preview,
}: {
  slug: AgentSlug;
  /** Wrap the words to highlight in <em>. */
  headline: ReactNode;
  lede: ReactNode;
  chips: ProofChip[];
  preview?: ReactNode;
}) {
  const agent = getAgent(slug);
  return (
    <section className="jk-hero" aria-labelledby="jk-hero-title">
      <div className="jk-container jk-hero-grid">
        <div className="jk-hero-copy">
          <p className="jk-hero-kicker">
            <span className="jk-hero-badge">
              <AgentIcon name={agent.icon} size={22} />
            </span>
            <span>
              <span className="jk-hero-name">{agent.name}</span>
              <span className="jk-hero-category">{agent.category}</span>
            </span>
          </p>

          <h1 id="jk-hero-title" className="jk-display">
            {headline}
          </h1>
          <p className="jk-lede">{lede}</p>

          <div className="jk-hero-actions">
            <a href={`#${WORKSPACE_ID}`} className="jk-btn jk-btn--primary jk-btn--lg">
              Try it now
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={CONTACT_URL} className="jk-btn jk-btn--ghost jk-btn--lg">
              Get this for your business
            </a>
          </div>

          <ul className="jk-chips" aria-label="Highlights">
            {chips.map(({ icon: Icon, label }) => (
              <li key={label} className="jk-chip">
                <Icon size={15} strokeWidth={2} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {preview && <div className="jk-hero-preview">{preview}</div>}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Section heading                                                   */
/* ---------------------------------------------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  text,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  id?: string;
}) {
  return (
    <div className="jk-heading">
      <p className="jk-eyebrow">{eyebrow}</p>
      <h2 id={id} className="jk-h2">
        {title}
      </h2>
      {text && <p className="jk-heading-text">{text}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Workspace — the card the actual tool lives in.                    */
/* ---------------------------------------------------------------- */

export function WorkspaceSection({
  title,
  text,
  actions,
  children,
}: {
  title: string;
  text: ReactNode;
  /** e.g. the "Try sample data" button. */
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={WORKSPACE_ID} className="jk-section jk-workspace" aria-labelledby="jk-workspace-title">
      <div className="jk-container">
        <div className="jk-workspace-head">
          <div>
            <p className="jk-eyebrow">Workspace</p>
            <h2 id="jk-workspace-title" className="jk-h2">
              {title}
            </h2>
            <p className="jk-heading-text">{text}</p>
          </div>
          {actions && <div className="jk-workspace-actions">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Dimmed example output shown before the first run. */
export function EmptyPreview({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="jk-empty">
      <div className="jk-empty-note">
        <p className="jk-empty-title">{title}</p>
        <p className="jk-empty-text">{text}</p>
      </div>
      <div className="jk-empty-sample" aria-hidden="true" inert>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* How it works — sticky heading left, numbered steps right.         */
/* ---------------------------------------------------------------- */

export type HowStep = { icon: LucideIcon; title: string; text: string };

export function HowItWorks({ title, text, steps }: { title: ReactNode; text: ReactNode; steps: HowStep[] }) {
  return (
    <section className="jk-section jk-section--surface" aria-labelledby="jk-how-title">
      <div className="jk-container jk-how">
        <div className="jk-how-intro">
          <SectionHeading eyebrow="How it works" title={title} text={text} id="jk-how-title" />
        </div>
        <ol className="jk-how-steps">
          {steps.map(({ icon: Icon, title: stepTitle, text: stepText }, i) => (
            <li key={stepTitle} className="jk-how-step jk-reveal">
              <span className="jk-how-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="jk-how-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <h3 className="jk-h3">{stepTitle}</h3>
                <p>{stepText}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Use cases — asymmetric grid, the first case is featured.          */
/* ---------------------------------------------------------------- */

export type UseCase = { icon: LucideIcon; title: string; text: string; who: string };

export function UseCases({ title, text, items }: { title: ReactNode; text?: ReactNode; items: UseCase[] }) {
  return (
    <section className="jk-section" aria-labelledby="jk-uses-title">
      <div className="jk-container">
        <SectionHeading eyebrow="What you can use it for" title={title} text={text} id="jk-uses-title" />
        <ul className="jk-uses">
          {items.map(({ icon: Icon, title: useTitle, text: useText, who }, i) => (
            <li key={useTitle} className={`jk-use jk-reveal${i === 0 ? " jk-use--featured" : ""}`}>
              <span className="jk-use-icon">
                <Icon size={i === 0 ? 24 : 20} aria-hidden="true" />
              </span>
              <h3 className="jk-h3">{useTitle}</h3>
              <p>{useText}</p>
              <p className="jk-use-who">{who}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Related agents — each card in that agent's own colours.           */
/* ---------------------------------------------------------------- */

export function RelatedAgents({ slug, zone }: { slug: AgentSlug; zone: SiteZone }) {
  return (
    <section className="jk-section jk-section--surface" aria-labelledby="jk-related-title">
      <div className="jk-container">
        <div className="jk-related-head">
          <SectionHeading eyebrow="More agents" title="Pairs well with" id="jk-related-title" />
        </div>
        <ul className="jk-related">
          {getRelatedAgents(slug).map((a) => (
            <li key={a.slug} style={agentVars(a)}>
              <a href={agentHref(zone, a)} className="jk-related-card">
                <span className="jk-agent-badge jk-agent-badge--lg">
                  <AgentIcon name={a.icon} size={20} />
                </span>
                <span className="jk-related-category">{a.category}</span>
                <span className="jk-related-name">{a.shortName}</span>
                <span className="jk-related-tagline">{a.tagline}</span>
                <span className="jk-related-open">
                  Open agent <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
