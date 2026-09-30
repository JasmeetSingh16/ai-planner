"use client";

import {
  ArrowRight,
  CalendarRange,
  Globe,
  Monitor,
  RotateCcw,
  Smartphone,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { EmptyPreview, WorkspaceSection } from "../components/agent/AgentTemplate";
import { CopyButton, LoadingSteps, ScoreBar, ScoreGauge } from "../components/agent/AgentUi";
import ReportGate, { ReportCta } from "../components/agent/ReportGate";
import type { ReportGateInfo } from "../lib/lead-gate";
import { ScoreRadar, VitalTile, rating } from "./SeoCharts";
import {
  categoryLabels,
  exampleAudit,
  sampleSites,
  type AuditData,
  type AuditResponse,
  type PageSpeedStrategy,
  type Recommendation,
  type WebsiteData,
} from "./seo-data";
import { previewOf, summaryOf } from "./report-gate";

const LOADING_STEPS = [
  "Fetching the live page",
  "Running PageSpeed (mobile & desktop)",
  "Checking SEO & accessibility",
  "Scoring UX & conversion",
  "Writing the 30-day plan",
];

function getScoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Needs work";
  return "Poor";
}

export default function SeoAuditor() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  // Set while the full audit is locked behind the email form.
  const [gate, setGate] = useState<ReportGateInfo | null>(null);
  const [error, setError] = useState("");
  const [sampleIndex, setSampleIndex] = useState(-1);

  const workspaceRef = useRef<HTMLFormElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function fillSample() {
    const next = (sampleIndex + 1) % sampleSites.length;
    setSampleIndex(next);
    setUrl(sampleSites[next]);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setResult(null);
    setGate(null);

    let formattedUrl = url.trim();

    if (!formattedUrl) {
      setError("Please enter a website URL.");
      inputRef.current?.focus();
      return;
    }

    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setError("Please enter a valid website URL.");
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    outputRef.current?.scrollIntoView({ block: "start" });

    try {
      const response = await fetch("/ai-planner/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formattedUrl,
        }),
      });

      const { gate: gateInfo, ...data } = (await response.json()) as AuditResponse & { gate?: ReportGateInfo | null };

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to analyze this website.");
      }

      setResult(data);
      setGate(gateInfo ?? null);
    } catch (err) {
      console.error("Audit request error:", err);

      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      workspaceRef.current?.scrollIntoView({ block: "center" });
    } finally {
      setLoading(false);
    }
  }

  function handleNewAudit() {
    setResult(null);
    setGate(null);
    setError("");
    workspaceRef.current?.scrollIntoView({ block: "center" });
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <WorkspaceSection
      title="Audit a website"
      text="Enter any public URL. The audit fetches the live page and runs Google PageSpeed on mobile and desktop — it usually takes 30–60 seconds."
      actions={
        <button type="button" className="jk-btn jk-btn--soft" onClick={fillSample} disabled={loading}>
          <Sparkles size={16} aria-hidden="true" />
          {sampleIndex < 0 ? "Try sample data" : "Try another sample"}
        </button>
      }
    >
      <form ref={workspaceRef} onSubmit={handleSubmit} className="jk-card seo-search" noValidate>
        <label htmlFor="seo-url" className="jk-sr">
          Website URL
        </label>
        <div className="seo-search-row">
          <Globe size={20} aria-hidden="true" className="seo-search-icon" />
          <input
            id="seo-url"
            ref={inputRef}
            type="text"
            inputMode="url"
            autoComplete="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="yourwebsite.com"
            disabled={loading}
            aria-invalid={error ? true : undefined}
            aria-describedby="seo-url-hint"
            className="seo-search-input"
          />
          <button type="submit" disabled={loading} className="jk-btn jk-btn--primary jk-btn--lg seo-search-button">
            {loading ? "Auditing…" : "Audit website"}
            {!loading && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        </div>

        <div className="seo-search-foot">
          <p id="seo-url-hint" className="jk-hint">
            No account needed. Try:
          </p>
          {sampleSites.map((site) => (
            <button
              key={site}
              type="button"
              className="seo-chip"
              disabled={loading}
              onClick={() => {
                setUrl(site);
                setError("");
              }}
            >
              {site.replace(/^https?:\/\/(www\.)?/, "")}
            </button>
          ))}
        </div>

        {error && (
          <div className="jk-error mx-4 mb-4 sm:mx-6 sm:mb-6" role="alert">
            <TriangleAlert size={18} aria-hidden="true" className="mt-px shrink-0" />
            {error}
          </div>
        )}
      </form>

      <p className="jk-sr" role="status">
        {result?.success && !loading ? "Audit ready." : ""}
      </p>

      <div ref={outputRef} className="seo-output">
        {loading ? (
          <div className="jk-card">
            <LoadingSteps steps={LOADING_STEPS} interval={7000} />
          </div>
        ) : result?.success && result.audit ? (
          <>
            <SeoReport
              audit={gate ? previewOf(result).audit! : result.audit}
              website={result.website}
              onReset={handleNewAudit}
              part={gate ? "preview" : "all"}
            />
            {gate ? (
              <ReportGate
                agent="seo-planner"
                gate={gate}
                input={result.website?.url ?? url}
                summary={summaryOf(result)}
                onUnlock={(full) => {
                  if (full) setResult(full as AuditResponse);
                  setGate(null);
                }}
              >
                {/* Sealed audits aren't in the page yet: blur the example's plan instead. */}
                <SeoReport audit={gate.token ? exampleAudit.audit : result.audit} part="locked" />
              </ReportGate>
            ) : (
              <ReportCta />
            )}
          </>
        ) : (
          <EmptyPreview
            title="Your audit appears here"
            text="Six scores, Core Web Vitals, prioritised fixes and a 30-day plan. Here's an example."
          >
            <SeoReport audit={exampleAudit.audit} website={exampleAudit.website} />
          </EmptyPreview>
        )}
      </div>
    </WorkspaceSection>
  );
}

/* ------------------------------------------------------------------ */
/* REPORT                                                              */
/* ------------------------------------------------------------------ */

function planAsText(audit: AuditData, website?: WebsiteData) {
  return [
    `Website audit — ${website?.url ?? ""}`,
    `Overall score: ${audit.overallScore}/100`,
    "",
    audit.summary,
    "",
    "Recommendations:",
    ...audit.recommendations.map((r) => `- [${r.priority}] ${r.title}: ${r.description}`),
    "",
    "30-day plan:",
    ...audit.improvementPlan.flatMap((w) => [`${w.week} — ${w.focus}`, ...(w.actions || []).map((a) => `  - ${a}`)]),
  ].join("\n");
}

/**
 * part: "all" = the full audit; "preview" = before the email form (just
 * the site's name and URL); "locked" = everything else, blurred behind the form.
 */
function SeoReport({
  audit,
  website,
  onReset,
  part = "all",
}: {
  audit: AuditData;
  website?: WebsiteData;
  onReset?: () => void;
  part?: "all" | "preview" | "locked";
}) {
  const strategies = [audit.pageSpeed?.mobile, audit.pageSpeed?.desktop].filter(Boolean) as PageSpeedStrategy[];

  return (
    <article className="seo-report" aria-label="Website audit">
      {part !== "locked" && (
        <header className="seo-report-head">
          <div className="min-w-0">
            <p className="jk-eyebrow">Website audit</p>
            <h3 className="seo-report-title">{website?.title || "Website analysis"}</h3>
            <p className="mt-1 break-all text-sm text-[var(--jk-muted)]">{website?.url}</p>
          </div>
          {onReset && (
            <div className="flex flex-wrap gap-2">
              {part === "all" && <CopyButton text={planAsText(audit, website)} label="Copy plan" />}
              <button type="button" className="jk-copy" onClick={onReset}>
                <RotateCcw size={15} aria-hidden="true" />
                Audit another site
              </button>
            </div>
          )}
        </header>
      )}

      {part !== "preview" && (
        <>
          {/* Overall + radar */}
          <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
            <section className="jk-card jk-card-pad flex flex-col" aria-label="Overall score">
              <p className="jk-label-sm">Overall score</p>
              <div className="mt-4 flex flex-col items-center gap-5">
                <ScoreGauge value={audit.overallScore} label={getScoreLabel(audit.overallScore)} size={180} />
                <p className="text-[15px] leading-7 text-[var(--jk-body)]">
                  {audit.summary || "No summary was provided for this audit."}
                </p>
              </div>
            </section>

            <section className="jk-card jk-card-pad" aria-label="Scores by category">
              <p className="jk-label-sm">Scores by category</p>
              <div className="mt-2 grid items-center gap-4 sm:grid-cols-[auto_1fr]">
                <div className="mx-auto w-full max-w-[280px]">
                  <ScoreRadar scores={audit.scores} size={280} />
                </div>
                <div className="grid gap-4">
                  {categoryLabels.map(({ key, label }) => (
                    <ScoreBar key={key} label={label} value={audit.scores[key]} max={100} />
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Core Web Vitals */}
          {audit.pageSpeed?.available && strategies.length > 0 && (
            <section className="jk-card jk-card-pad mt-4" aria-labelledby="seo-vitals">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="jk-label-sm">Google PageSpeed Insights</p>
                  <h4 id="seo-vitals" className="mt-1 text-xl font-bold tracking-tight text-[var(--jk-ink)]">
                    Core Web Vitals
                  </h4>
                </div>
                {audit.pageSpeed.mobile?.fieldCategory && (
                  <p className="jk-hint">
                    Chrome UX field rating: <strong>{audit.pageSpeed.mobile.fieldCategory}</strong>
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {strategies.map((s) => (
                  <div key={s.strategy}>
                    <div className="mb-3 flex items-center gap-2 text-[var(--jk-ink)]">
                      {s.strategy === "mobile" ? (
                        <Smartphone size={17} aria-hidden="true" />
                      ) : (
                        <Monitor size={17} aria-hidden="true" />
                      )}
                      <span className="font-semibold capitalize">{s.strategy}</span>
                      <span className={`seo-perf seo-perf--${rating(s.performance).tone}`}>
                        Performance {s.performance ?? "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {s.vitals.slice(0, 4).map((v) => (
                        <VitalTile key={`${s.strategy}-${v.id}`} vital={v} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Critical issues */}
          <CriticalIssues issues={audit.criticalIssues} />
          <Recommendations recs={audit.recommendations} />
          <ImprovementPlan weeks={audit.improvementPlan} />
          <p className="jk-fineprint mx-auto mt-6 max-w-3xl text-center">
            {audit.disclaimer ||
              "SEO, UX, accessibility and conversion scores come from HTML analysis. Performance uses PageSpeed Insights when available."}
          </p>
        </>
      )}
    </article>
  );
}

function CriticalIssues({ issues }: { issues: AuditData["criticalIssues"] }) {
  return (
    <section className="jk-card jk-card-pad mt-4" aria-labelledby="seo-issues">
      <h4 id="seo-issues" className="text-xl font-bold tracking-tight text-[var(--jk-ink)]">
        What needs attention first
      </h4>
      {issues?.length ? (
        <ol className="seo-issues">
          {issues.map((issue, index) => (
            <li key={`${issue.title}-${index}`} className="seo-issue">
              <span className="seo-issue-num">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-semibold text-[var(--jk-ink)]">{issue.title}</p>
                <p className="mt-1 text-[14.5px] leading-6 text-[var(--jk-body)]">{issue.description}</p>
                {issue.impact && (
                  <p className="mt-2 text-[13.5px] leading-6 text-[var(--jk-muted)]">
                    <strong className="text-[var(--jk-body)]">Impact:</strong> {issue.impact}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-[var(--jk-muted)]">No critical issues were returned by the AI.</p>
      )}
    </section>
  );
}

function Recommendations({ recs }: { recs: Recommendation[] }) {
  return (
    <section className="mt-4" aria-labelledby="seo-recs">
      <h4 id="seo-recs" className="mb-3 text-xl font-bold tracking-tight text-[var(--jk-ink)]">
        Recommendations by priority
      </h4>
      {recs?.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {(["High", "Medium", "Low"] as Recommendation["priority"][]).map((priority) => {
            const items = recs.filter((r) => r.priority === priority);
            return (
              <div key={priority} className={`seo-lane seo-lane--${priority.toLowerCase()}`}>
                <p className="seo-lane-head">
                  {priority} priority <span>{items.length}</span>
                </p>
                {items.length ? (
                  <ul className="grid gap-2">
                    {items.map((r, i) => (
                      <li key={`${r.title}-${i}`} className="seo-rec">
                        <p className="font-semibold text-[var(--jk-ink)]">{r.title}</p>
                        <p className="mt-1 text-[14px] leading-6 text-[var(--jk-body)]">{r.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-1 text-sm text-[var(--jk-muted)]">Nothing at this level.</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="jk-card jk-card-pad text-sm text-[var(--jk-muted)]">No recommendations were returned.</p>
      )}
    </section>
  );
}

function ImprovementPlan({ weeks }: { weeks: AuditData["improvementPlan"] }) {
  return (
    <section className="jk-card jk-card-pad mt-4" aria-labelledby="seo-plan">
      <div className="flex items-center gap-2">
        <CalendarRange size={18} aria-hidden="true" className="text-[var(--agent-accent)]" />
        <h4 id="seo-plan" className="text-xl font-bold tracking-tight text-[var(--jk-ink)]">
          Your 30-day plan
        </h4>
      </div>
      {weeks?.length ? (
        <ol className="seo-timeline">
          {weeks.map((week, index) => (
            <li key={`${week.week}-${index}`} className="seo-week">
              <span className="seo-week-dot" aria-hidden="true" />
              <p className="seo-week-label">{week.week || `Week ${index + 1}`}</p>
              <p className="mt-1 font-semibold text-[var(--jk-ink)]">{week.focus || "Improvement focus"}</p>
              {week.actions?.length ? (
                <ul className="mt-3 grid gap-2">
                  {week.actions.map((action, i) => (
                    <li key={`${action}-${i}`} className="flex gap-2 text-[14px] leading-6 text-[var(--jk-body)]">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--agent-accent)]" />
                      {action}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[var(--jk-muted)]">No specific actions were returned for this week.</p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-[var(--jk-muted)]">No improvement roadmap was returned.</p>
      )}
    </section>
  );
}
