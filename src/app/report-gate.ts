/* ------------------------------------------------------------------ */
/* What the free preview shows before the "Get your full report" form. */
/* Used by the API route (to build the preview it sends) and the page  */
/* (when the report isn't sealed and is only blurred).                 */
/* ------------------------------------------------------------------ */

import type { AuditData, AuditResponse } from "./seo-data";

/** Only the site's name and URL — the whole audit is locked. */
export function previewOf<T extends AuditResponse>(report: T): T {
  if (!report.audit) return report;
  const audit: AuditData = {
    ...report.audit,
    overallScore: 0,
    scores: { seo: 0, ux: 0, accessibility: 0, performance: 0, mobile: 0, conversion: 0 },
    summary: "",
    criticalIssues: [],
    recommendations: [],
    improvementPlan: [],
    pageSpeed: undefined,
    disclaimer: undefined,
  };
  return { ...report, audit };
}

export function summaryOf(report: AuditResponse): string {
  const audit = report.audit;
  if (!audit) return "";
  const s = audit.scores;
  return `Overall ${audit.overallScore}/100 (SEO ${s.seo}, UX ${s.ux}, performance ${s.performance}, mobile ${s.mobile}, accessibility ${s.accessibility}, conversion ${s.conversion}) · ${audit.criticalIssues?.length ?? 0} critical issues`;
}
