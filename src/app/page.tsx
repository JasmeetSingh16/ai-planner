"use client";

import { FormEvent, useState } from "react";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type ScoreData = {
  seo: number;
  ux: number;
  accessibility: number;
  performance: number;
  mobile: number;
  conversion: number;
};

type CriticalIssue = {
  title: string;
  description: string;
  impact: string;
};

type Recommendation = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
};

type ImprovementWeek = {
  week: string;
  focus: string;
  actions: string[];
};

type PageSpeedVital = {
  id: string;
  title: string;
  displayValue: string;
  score: number | null;
};

type PageSpeedStrategy = {
  strategy: "mobile" | "desktop";
  performance: number | null;
  accessibility: number | null;
  seo: number | null;
  bestPractices: number | null;
  vitals: PageSpeedVital[];
  fieldCategory: string | null;
};

type AuditData = {
  overallScore: number;
  scores: ScoreData;
  summary: string;
  criticalIssues: CriticalIssue[];
  recommendations: Recommendation[];
  improvementPlan: ImprovementWeek[];
  pageSpeed?: {
    available: boolean;
    error: string | null;
    mobile: PageSpeedStrategy | null;
    desktop: PageSpeedStrategy | null;
  };
  disclaimer?: string;
};

type WebsiteData = {
  url: string;
  title: string;
  description: string;
};

type AuditResponse = {
  success: boolean;
  website?: WebsiteData;
  audit?: AuditData;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function getScoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Needs Work";
  return "Poor";
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-600";
  if (score >= 75) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

function getScoreBarColor(score: number) {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function getPriorityClasses(priority: string) {
  switch (priority) {
    case "High":
      return "border-red-200 bg-red-50 text-red-700";

    case "Medium":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "Low":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

/* -------------------------------------------------------------------------- */
/* SCORE CARD                                                                 */
/* -------------------------------------------------------------------------- */

function ScoreCard({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">{label}</span>

        <span
          className={`text-sm font-bold ${getScoreColor(score)}`}
        >
          {score}/100
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(
            score
          )}`}
          style={{
            width: `${Math.min(Math.max(score, 0), 100)}%`,
          }}
        />
      </div>

      <div className="mt-3 text-xs text-slate-400">
        {getScoreLabel(score)}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN PAGE                                                                  */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* SUBMIT                                                                   */
  /* ------------------------------------------------------------------------ */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setResult(null);

    let formattedUrl = url.trim();

    if (!formattedUrl) {
      setError("Please enter a website URL.");
      return;
    }

    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }

    setLoading(true);

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

      const data: AuditResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to analyze this website."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Audit request error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* RESET                                                                    */
  /* ------------------------------------------------------------------------ */

  function handleNewAudit() {
    setResult(null);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ==================================================================== */}
      {/* NAVIGATION                                                           */}
      {/* ==================================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-sm shadow-indigo-200">
              <span className="text-sm font-bold text-white">AI</span>
            </div>

            <div>
              <div className="text-sm font-bold tracking-wide text-slate-900">
                Jaseir
              </div>

              <div className="text-[11px] font-medium text-slate-500">
                AI Agent Hub · Website Auditor
              </div>
            </div>
          </div>

          <a
            href="https://jaseir.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 hover:shadow"
          >
            Built by Jaseir
          </a>

        </div>
      </header>

      {/* ==================================================================== */}
      {/* HERO                                                                 */}
      {/* ==================================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200">

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-220px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute left-[5%] top-[30%] h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute right-[5%] top-[35%] h-64 w-64 rounded-full bg-purple-100/50 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center lg:px-8 lg:pt-28">

          

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            Know what your
            <span className="block bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              website needs next.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
  Get a clear picture of what is holding your website back and
  discover the most important improvements to make next.
</p>

          {/* ================================================================ */}
          {/* AUDIT FORM                                                       */}
          {/* ================================================================ */}

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-3xl"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60 sm:flex sm:items-center sm:gap-2">

              <input
                type="text"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Enter your website URL"
                disabled={loading}
                className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
              >
                {loading ? "Analyzing..." : "Analyze Website"}
              </button>

            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <p className="mt-4 text-xs text-slate-400">
              No account required. Enter any publicly accessible website.
            </p>
          </form>

          {/* Trust indicators */}

          <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-400">
  <span className="flex items-center gap-2">
    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
    Identify Opportunities
  </span>

  <span className="flex items-center gap-2">
    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
    Prioritize Improvements
  </span>

  <span className="flex items-center gap-2">
    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
    Get an Action Plan
  </span>
</div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* LOADING                                                              */}
      {/* ==================================================================== */}

      {loading && (
        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">

            <div className="mx-auto max-w-xl text-center">

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Analyzing your website
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Fetching the live page, Google PageSpeed / Lighthouse
                lab data, and turning verified findings into an audit.
              </p>

              <div className="mt-8 space-y-3 text-left">

                {[
                  "Scanning website structure",
                  "Running PageSpeed Insights",
                  "Checking SEO and accessibility",
                  "Evaluating UX and conversion",
                  "Writing the 30-day plan",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        index < 2
                          ? "animate-pulse bg-indigo-600"
                          : "bg-slate-200"
                      }`}
                    />

                    <span className="text-sm font-medium text-slate-600">
                      {item}
                    </span>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* RESULTS                                                              */}
      {/* ==================================================================== */}

      {result?.success && result.audit && (
        <section className="border-b border-slate-200 bg-slate-50">

          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">

            {/* ================================================================ */}
            {/* RESULT HEADER                                                     */}
            {/* ================================================================ */}

            <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <div className="mb-3 inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                  Jaseir Website Audit
                </div>

                <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {result.website?.title || "Website Analysis"}
                </h2>

                <p className="mt-3 break-all text-sm text-slate-500">
                  {result.website?.url}
                </p>
              </div>

              <button
                onClick={handleNewAudit}
                className="w-fit rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 hover:shadow"
              >
                Analyze another website
              </button>

            </div>

            {/* ================================================================ */}
            {/* OVERALL SCORE                                                     */}
            {/* ================================================================ */}

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">

              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-100 blur-3xl" />

                <div className="relative">
                  <div className="text-sm font-medium text-slate-500">
                    Overall Score
                  </div>

                  <div className="mt-5 flex items-end gap-3">
                    <span
                      className={`text-7xl font-bold tracking-[-0.06em] ${getScoreColor(
                        result.audit.overallScore
                      )}`}
                    >
                      {result.audit.overallScore}
                    </span>

                    <span className="mb-3 text-sm font-medium text-slate-400">
                      /100
                    </span>
                  </div>

                  <div
                    className={`mt-4 text-sm font-bold ${getScoreColor(
                      result.audit.overallScore
                    )}`}
                  >
                    {getScoreLabel(result.audit.overallScore)}
                  </div>

                  <div className="mt-7 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getScoreBarColor(
                        result.audit.overallScore
                      )}`}
                      style={{
                        width: `${Math.min(
                          Math.max(result.audit.overallScore, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* CATEGORY SCORES                                               */}
              {/* ============================================================ */}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                <ScoreCard
                  label="SEO"
                  score={result.audit.scores.seo}
                />

                <ScoreCard
                  label="User Experience"
                  score={result.audit.scores.ux}
                />

                <ScoreCard
                  label="Accessibility"
                  score={result.audit.scores.accessibility}
                />

                <ScoreCard
                  label="Performance"
                  score={result.audit.scores.performance}
                />

                <ScoreCard
                  label="Mobile"
                  score={result.audit.scores.mobile}
                />

                <ScoreCard
                  label="Conversion"
                  score={result.audit.scores.conversion}
                />

              </div>
            </div>

            {/* ================================================================ */}
            {/* PAGESPEED                                                         */}
            {/* ================================================================ */}

            {result.audit.pageSpeed?.available && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                      Google PageSpeed Insights
                    </div>

                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      Lighthouse lab metrics
                    </h3>
                  </div>

                  {result.audit.pageSpeed.mobile?.fieldCategory && (
                    <div className="text-xs font-medium text-slate-500">
                      Chrome UX field rating:{" "}
                      <span className="font-bold text-slate-700">
                        {result.audit.pageSpeed.mobile.fieldCategory}
                      </span>
                    </div>
                  )}

                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  {[
                    result.audit.pageSpeed.mobile,
                    result.audit.pageSpeed.desktop,
                  ]
                    .filter(Boolean)
                    .map((strategy) => (
                      <div
                        key={strategy!.strategy}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >

                        <div className="mb-4 flex items-center justify-between">

                          <span className="text-sm font-bold capitalize text-slate-700">
                            {strategy!.strategy}
                          </span>

                          <span
                            className={`text-sm font-bold ${getScoreColor(
                              strategy!.performance ?? 0
                            )}`}
                          >
                            {strategy!.performance ?? "—"}/100
                          </span>

                        </div>

                        <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white py-3 text-center text-[11px] font-medium text-slate-400">

                          <div>
                            <div className="text-sm font-bold text-slate-800">
                              {strategy!.seo ?? "—"}
                            </div>
                            SEO
                          </div>

                          <div>
                            <div className="text-sm font-bold text-slate-800">
                              {strategy!.accessibility ?? "—"}
                            </div>
                            A11y
                          </div>

                          <div>
                            <div className="text-sm font-bold text-slate-800">
                              {strategy!.bestPractices ?? "—"}
                            </div>
                            Best practices
                          </div>

                        </div>

                        <div className="space-y-3">

                          {strategy!.vitals.map((vital) => (
                            <div
                              key={`${strategy!.strategy}-${vital.id}`}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <span className="text-slate-500">
                                {vital.title}
                              </span>

                              <span className="shrink-0 font-semibold text-slate-800">
                                {vital.displayValue}
                              </span>
                            </div>
                          ))}

                        </div>

                      </div>
                    ))}

                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* EXECUTIVE SUMMARY                                                */}
            {/* ================================================================ */}

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

              <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Executive Summary
              </div>

              <p className="max-w-4xl text-base leading-8 text-slate-600">
                {result.audit.summary ||
                  "No summary was provided for this audit."}
              </p>

            </div>

            {/* ================================================================ */}
            {/* CRITICAL ISSUES                                                  */}
            {/* ================================================================ */}

            <div className="mt-16">

              <div className="mb-7">

                <div className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                  Priority Findings
                </div>

                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  What needs attention first
                </h3>

              </div>

              {result.audit.criticalIssues &&
              result.audit.criticalIssues.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">

                  {result.audit.criticalIssues.map(
                    (issue, index) => (
                      <div
                        key={`${issue.title}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                      >

                        <div className="flex items-start gap-4">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-600">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div>

                            <h4 className="font-bold text-slate-900">
                              {issue.title}
                            </h4>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                              {issue.description}
                            </p>

                            {issue.impact && (
                              <div className="mt-4 border-t border-slate-100 pt-4">

                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Impact
                                </div>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                  {issue.impact}
                                </p>

                              </div>
                            )}

                          </div>
                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                  No critical issues were returned by the AI.
                </div>
              )}

            </div>

            {/* ================================================================ */}
            {/* RECOMMENDATIONS                                                  */}
            {/* ================================================================ */}

            <div className="mt-16">

              <div className="mb-7">

                <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                  AI Recommendations
                </div>

                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  Actions that can improve the site
                </h3>

              </div>

              {result.audit.recommendations &&
              result.audit.recommendations.length > 0 ? (
                <div className="grid gap-4">

                  {result.audit.recommendations.map(
                    (recommendation, index) => (
                      <div
                        key={`${recommendation.title}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                      >

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-xs font-bold text-indigo-600">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                              <h4 className="font-bold text-slate-900">
                                {recommendation.title}
                              </h4>

                              <span
                                className={`w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getPriorityClasses(
                                  recommendation.priority
                                )}`}
                              >
                                {recommendation.priority}
                              </span>

                            </div>

                            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                              {recommendation.description}
                            </p>

                          </div>
                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                  No recommendations were returned.
                </div>
              )}

            </div>

            {/* ================================================================ */}
            {/* 30 DAY ROADMAP                                                   */}
            {/* ================================================================ */}

            <div className="mt-16">

              <div className="mb-7">

                <div className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
                  30-Day Improvement Plan
                </div>

                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  A practical roadmap
                </h3>

              </div>

              {result.audit.improvementPlan &&
              result.audit.improvementPlan.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">

                  {result.audit.improvementPlan.map(
                    (week, index) => (
                      <div
                        key={`${week.week}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-600">
                            {week.week || `Week ${index + 1}`}
                          </span>

                          <span className="text-xs font-bold text-slate-300">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                        </div>

                        <h4 className="mt-5 text-lg font-bold text-slate-900">
                          {week.focus || "Improvement focus"}
                        </h4>

                        <ul className="mt-5 space-y-3">

                          {(week.actions || []).map(
                            (action, actionIndex) => (
                              <li
                                key={`${action}-${actionIndex}`}
                                className="flex gap-3 text-sm leading-6 text-slate-600"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />

                                <span>{action}</span>
                              </li>
                            )
                          )}

                        </ul>

                        {(!week.actions ||
                          week.actions.length === 0) && (
                          <p className="mt-5 text-sm text-slate-400">
                            No specific actions were returned for
                            this week.
                          </p>
                        )}

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                  No improvement roadmap was returned.
                </div>
              )}

            </div>

            {/* ================================================================ */}
            {/* DISCLAIMER                                                       */}
            {/* ================================================================ */}

            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-xs leading-5 text-slate-400">
                {result.audit.disclaimer ||
                  "SEO, UX, accessibility and conversion scores come from HTML analysis. Performance uses PageSpeed Insights when available."}
              </p>

            </div>

            {/* ================================================================ */}
            {/* CTA                                                              */}
            {/* ================================================================ */}

            <div className="relative mt-16 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 p-8 shadow-xl shadow-indigo-100 sm:p-12">

              <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

              <div className="relative max-w-2xl">

                <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-100">
                  Need help implementing this?
                </div>

                <h3 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Turn the audit into a better website.
                </h3>

                <p className="mt-5 text-sm leading-7 text-indigo-100">
                  Jaseir helps businesses design, build and improve
                  high-performing websites with strategy, UX,
                  development and AI-powered workflows.
                </p>

                <a
                  href="https://jaseir.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
                >
                  Work with Jaseir
                  <span className="ml-2">→</span>
                </a>

              </div>
            </div>

          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* FEATURES                                                             */}
      {/* ==================================================================== */}

      {!result && !loading && (
        <>
          <section className="border-b border-slate-200 bg-white">

            <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-8">

              {[
                {
                  number: "01",
                  title: "SEO Intelligence",
                  text: "Identify structural SEO opportunities and content issues.",
                },
                {
                  number: "02",
                  title: "UX Analysis",
                  text: "Understand how the site's structure affects visitors.",
                },
                {
                  number: "03",
                  title: "Technical Signals",
                  text: "Review accessibility, mobile and technical indicators.",
                },
                {
                  number: "04",
                  title: "Action Plan",
                  text: "Get prioritized recommendations and a 30-day roadmap.",
                },
              ].map((feature) => (
                <div
                  key={feature.number}
                  className="px-6 py-10 first:pl-0 last:pr-0 sm:px-8 lg:px-10"
                >

                  <div className="text-xs font-bold text-indigo-500">
                    {feature.number}
                  </div>

                  <h3 className="mt-5 text-sm font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {feature.text}
                  </p>

                </div>
              ))}

            </div>
          </section>

          {/* ================================================================ */}
          {/* HOW IT WORKS                                                      */}
          {/* ================================================================ */}

          <section className="bg-slate-50">

            <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">

              <div className="max-w-2xl">

                <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                  How it works
                </div>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  From URL to actionable insight.
                </h2>

                <p className="mt-5 text-sm leading-7 text-slate-600">
                  AI Planner combines HTML analysis, Google PageSpeed
                  Insights, and AI reasoning to turn verified signals
                  into useful business recommendations.
                </p>

              </div>

              <div className="mt-14 grid gap-6 md:grid-cols-3">

                {[
                  {
                    number: "01",
                    title: "Scan",
                    text: "The analyzer extracts HTML, metadata, headings, links, images and technical signals, then Google PageSpeed Insights runs Lighthouse.",
                  },
                  {
                    number: "02",
                    title: "Understand",
                    text: "AI evaluates the available signals across SEO, UX, accessibility, performance, mobile and conversion.",
                  },
                  {
                    number: "03",
                    title: "Act",
                    text: "You receive prioritized issues, recommendations and a practical 30-day improvement plan.",
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-600">
                      {step.number}
                    </div>

                    <h3 className="mt-8 text-lg font-bold text-slate-900">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {step.text}
                    </p>

                  </div>
                ))}

              </div>

            </div>
          </section>
        </>
      )}

      {/* ==================================================================== */}
      {/* FOOTER                                                               */}
      {/* ==================================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          <div>
            © {new Date().getFullYear()} Jaseir
          </div>

          <div className="flex items-center gap-5">

            <span>
              Website Auditor is the first AI agent from
            </span>

            <a
              href="https://jaseir.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Jaseir
            </a>

          </div>

        </div>
      </footer>

    </main>
  );
}