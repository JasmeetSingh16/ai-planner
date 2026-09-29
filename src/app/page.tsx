import {
  Bot,
  Briefcase,
  Gauge,
  LayoutTemplate,
  ListOrdered,
  RefreshCcw,
  ScanSearch,
  Smartphone,
} from "lucide-react";
import { AgentHero, AgentPage, HowItWorks, RelatedAgents, UseCases } from "../components/agent/AgentTemplate";
import { ScoreRadar, VitalTile } from "./SeoCharts";
import SeoAuditor from "./SeoAuditor";
import { exampleAudit } from "./seo-data";

const SLUG = "seo-planner";

function HeroPreview() {
  const { audit } = exampleAudit;
  const vitals = audit.pageSpeed?.mobile?.vitals ?? [];
  return (
    <div className="seo-hero-card" aria-hidden="true">
      <div className="jk-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--jk-line)] px-5 py-4">
          <span className="seo-favicon">N</span>
          <p className="min-w-0 truncate text-sm font-semibold text-[var(--jk-ink)]">northwind-dental.example</p>
          <span className="seo-score-pill ml-auto">{audit.overallScore}/100</span>
        </div>
        <div className="flex justify-center px-4 pt-2">
          <ScoreRadar scores={audit.scores} size={290} />
        </div>
        <div className="grid grid-cols-2 gap-2 px-5 pb-5">
          {vitals.slice(0, 2).map((v) => (
            <VitalTile key={v.id} vital={v} />
          ))}
        </div>
      </div>
      <p className="seo-float">
        <span className="seo-float-tag">High</span>
        Compress hero images → LCP −2.1 s
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <AgentPage slug={SLUG}>
      <AgentHero
        slug={SLUG}
        headline={
          <>
            See what&apos;s holding your site back — <em>and what to fix first.</em>
          </>
        }
        lede="Enter a URL. The planner reads the live page, runs Google PageSpeed on mobile and desktop, scores six areas out of 100 and turns the findings into a prioritised 30-day plan."
        chips={[
          { icon: Gauge, label: "Real PageSpeed data" },
          { icon: ListOrdered, label: "Fixes ranked by priority" },
          { icon: Bot, label: "Checks AI-search readiness" },
        ]}
        preview={<HeroPreview />}
      />

      <SeoAuditor />

      <HowItWorks
        title={
          <>
            From a URL to a <em>30-day plan</em> in under a minute.
          </>
        }
        text="Every score is grounded in something measured on the page — not a guess about what your site might contain."
        steps={[
          {
            icon: ScanSearch,
            title: "Scan the live page",
            text: "The analyzer reads your HTML — titles, meta tags, headings, links, images, forms and structured data — while Google PageSpeed runs Lighthouse on mobile and desktop.",
          },
          {
            icon: Gauge,
            title: "Score six areas",
            text: "SEO, performance, mobile, accessibility, user experience and conversion are each scored out of 100 from the verified signals.",
          },
          {
            icon: ListOrdered,
            title: "Get a plan you can act on",
            text: "Issues are ranked, recommendations grouped by priority, and the work laid out week by week so your team knows where to start.",
          },
        ]}
      />

      <UseCases
        title="When teams run an audit"
        items={[
          {
            icon: RefreshCcw,
            title: "Before and after a redesign",
            text: "Audit the old site to set a baseline, then re-run it after launch to prove the new build is faster and easier to find — not just prettier.",
            who: "For marketing leads and web teams",
          },
          {
            icon: Briefcase,
            title: "Pitching a new client",
            text: "Walk into the first call with a scored audit of their site and three concrete fixes.",
            who: "For agencies and freelancers",
          },
          {
            icon: Smartphone,
            title: "Fixing a slow mobile site",
            text: "See exactly which Core Web Vitals fail on phones and what's causing them.",
            who: "For ecommerce and local businesses",
          },
          {
            icon: LayoutTemplate,
            title: "Monthly SEO check-ins",
            text: "We can run this on a schedule and send your team the changes since last month, alongside Search Console data.",
            who: "Built by Jaseir for your stack",
          },
        ]}
      />

      <RelatedAgents slug={SLUG} zone={{ kind: "agent", slug: SLUG }} />
    </AgentPage>
  );
}

