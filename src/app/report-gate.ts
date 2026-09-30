/* ------------------------------------------------------------------ */
/* What the free preview shows before the "Get your full report" form. */
/* Used by the API route (to build the preview it sends) and the page  */
/* (when the report isn't sealed and is only blurred).                 */
/* ------------------------------------------------------------------ */

import type { AuditData, AuditResponse } from "./seo-data";

/** Critical issues shown in the preview. */
export const PREVIEW_ISSUES = 3;

/** Scores, summary and Core Web Vitals, plus the first three critical issues. */
export function previewOf<T extends AuditResponse>(report: T): T {
  if (!report.audit) return report;
  const audit: AuditData = {
    ...report.audit,
    criticalIssues: (report.audit.criticalIssues ?? []).slice(0, PREVIEW_ISSUES),
    recommendations: [],
    improvementPlan: [],
  };
  return { ...report, audit };
}

/** The issues, recommendations and 30-day plan the preview leaves out. */
export function lockedOf(audit: AuditData): Pick<AuditData, "criticalIssues" | "recommendations" | "improvementPlan"> {
  return {
    criticalIssues: (audit.criticalIssues ?? []).slice(PREVIEW_ISSUES),
    recommendations: audit.recommendations ?? [],
    improvementPlan: audit.improvementPlan ?? [],
  };
}

export function summaryOf(report: AuditResponse): string {
  const audit = report.audit;
  if (!audit) return "";
  const s = audit.scores;
  return `Overall ${audit.overallScore}/100 (SEO ${s.seo}, UX ${s.ux}, performance ${s.performance}, mobile ${s.mobile}, accessibility ${s.accessibility}, conversion ${s.conversion}) · ${audit.criticalIssues?.length ?? 0} critical issues`;
}
