// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

/* ------------------------------------------------------------------ */
/* SITE FOOTER — CTA band + link columns + legal bar, on every page.   */
/* On agent pages the CTA band picks up that agent's accent colour.    */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import { ArrowRight } from "lucide-react";
import CurrentYear from "./CurrentYear";
import { agents, agentVars, getAgent } from "../../lib/agents";
import {
  CONTACT_URL,
  LOGO_LIGHT_URL,
  MAIN_SITE_URL,
  agentHref,
  companyLinks,
  hubHref,
  serviceLinks,
  type SiteZone,
} from "../../lib/site";

export type FooterCta = {
  title: string;
  text: string;
};

const DEFAULT_CTA: FooterCta = {
  title: "Want an agent built for your business?",
  text: "Tell us the job you want off your team's plate. We'll scope the agent, the data it needs and the tools it should plug into — on a free call.",
};

export default function SiteFooter({ zone, cta = DEFAULT_CTA }: { zone: SiteZone; cta?: FooterCta }) {
  const agent = zone.kind === "agent" ? getAgent(zone.slug) : undefined;

  return (
    <footer className="jk-footer">
      <section
        className={`jk-cta-band${agent ? " jk-cta-band--agent" : ""}`}
        style={agent ? agentVars(agent) : undefined}
        aria-labelledby="jk-cta-title"
      >
        <div className="jk-container jk-cta-band-inner">
          <div>
            <h2 id="jk-cta-title" className="jk-cta-band-title">
              {cta.title}
            </h2>
            <p className="jk-cta-band-text">{cta.text}</p>
          </div>
          <a href={CONTACT_URL} className="jk-cta-band-button">
            Book a free consultation
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

      <div className="jk-container jk-footer-grid">
        <div className="jk-footer-brand">
          <a href={MAIN_SITE_URL} className="jk-footer-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_LIGHT_URL} alt="Jaseir" width={132} height={52} loading="lazy" />
          </a>
          <p>
            Jaseir AI builds practical AI agents that qualify leads, plan SEO and content, and answer
            from your own documents — then connects them to the tools your team already uses.
          </p>
        </div>

        <nav className="jk-footer-col" aria-label="AI Agents">
          <h2>AI Agents</h2>
          <ul>
            {agents.map((a) => (
              <li key={a.slug}>
                <a href={agentHref(zone, a)} style={agentVars(a)}>
                  <span className="jk-dot" aria-hidden="true" />
                  {a.shortName}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="jk-footer-col" aria-label="Services">
          <h2>Services</h2>
          <ul>
            {serviceLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="jk-footer-col" aria-label="Company">
          <h2>Company</h2>
          <ul>
            {companyLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="jk-container jk-footer-bottom">
        <p>
          © <CurrentYear renderedYear={new Date().getFullYear()} /> Jaseir Technologies Private Limited · Mohali, India
        </p>
        <a href={hubHref(zone, "/privacy/")}>Privacy</a>
      </div>
    </footer>
  );
}
