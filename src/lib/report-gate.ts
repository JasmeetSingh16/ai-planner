// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

/* ------------------------------------------------------------------ */
/* REPORT SEALING (server only) — keeps the full agent report out of   */
/* the browser until the visitor fills in the "Get your full report"   */
/* form.                                                               */
/*                                                                     */
/* The agent's API route returns a preview plus the full report        */
/* encrypted with AES-256-GCM (key: REPORT_UNLOCK_SECRET, shared by    */
/* every agent app and the dashboard). The dashboard's                 */
/* /api/agent-leads/ endpoint saves the lead, decrypts the token and   */
/* returns the full report. Stateless: nothing is stored per report.   */
/*                                                                     */
/* Without REPORT_UNLOCK_SECRET the route returns the full report and  */
/* the page falls back to blurring it (logged once as a warning).      */
/*                                                                     */
/* Never import this file from a client component.                     */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { clip, type GatedAgent, type ReportGateInfo } from "./lead-gate";

/** How long a visitor has to unlock a report after it was generated. */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/** What travels inside the token (all of it set by the agent's server). */
export type SealedReport = {
  agent: GatedAgent;
  /** What the visitor gave the agent, e.g. the URL they analysed. */
  input: string;
  /** One or two lines describing their result. */
  summary: string;
  /** The complete API response the page renders once unlocked. */
  full: unknown;
};

let warned = false;

function key(): Buffer | null {
  const secret = process.env.REPORT_UNLOCK_SECRET?.trim();
  if (!secret) {
    if (!warned) {
      console.warn("[report-gate] REPORT_UNLOCK_SECRET is not set — full reports are sent to the browser and only blurred.");
      warned = true;
    }
    return null;
  }
  return createHash("sha256").update(secret).digest();
}

function seal(report: SealedReport): string | null {
  const k = key();
  if (!k) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", k, iv);
  const plain = deflateRawSync(Buffer.from(JSON.stringify({ ...report, iat: Date.now() })));
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

export type OpenResult = { ok: true; report: SealedReport } | { ok: false; reason: "invalid" | "expired" | "not-configured" };

/** Decrypts a token made by gateReport(). */
export function openReport(token: string): OpenResult {
  const k = key();
  if (!k) return { ok: false, reason: "not-configured" };
  try {
    const raw = Buffer.from(token, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", k, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const plain = inflateRawSync(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]));
    const { iat, ...report } = JSON.parse(plain.toString("utf8")) as SealedReport & { iat: number };
    if (!(Date.now() - iat < TOKEN_TTL_MS)) return { ok: false, reason: "expired" };
    return { ok: true, report };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

/**
 * Builds a gated API response: the preview plus a sealed token, or — if
 * sealing isn't configured — the full report with `token: null`.
 */
export function gateReport<T extends object>({
  agent,
  input,
  summary,
  full,
  preview,
}: {
  agent: GatedAgent;
  input: string;
  summary: string;
  full: T;
  preview: T;
}): T & { gate: ReportGateInfo } {
  const token = seal({ agent, input: clip(input, 1000), summary: clip(summary, 500), full });
  return token ? { ...preview, gate: { token } } : { ...full, gate: { token: null } };
}
