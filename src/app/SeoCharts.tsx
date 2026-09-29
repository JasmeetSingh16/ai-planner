"use client";

import { useEffect, useState } from "react";
import { categoryLabels, type PageSpeedVital, type ScoreData } from "./seo-data";

/* ------------------------------------------------------------------ */
/* Radar chart of the six category scores.                             */
/* ------------------------------------------------------------------ */

export function ScoreRadar({ scores, size = 300 }: { scores: ScoreData; size?: number }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const c = 150;
  const r = 96;
  const n = categoryLabels.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, value: number) => {
    const d = (r * Math.max(0, Math.min(100, value))) / 100;
    return [c + d * Math.cos(angle(i)), c + d * Math.sin(angle(i))];
  };

  const shape = categoryLabels.map(({ key }, i) => point(i, drawn ? scores[key] : 0).join(",")).join(" ");
  const summary = categoryLabels.map(({ label, key }) => `${label} ${scores[key]}`).join(", ");

  return (
    <svg viewBox="0 0 300 300" width={size} height={size} className="seo-radar" role="img" aria-label={`Category scores: ${summary}`}>
      {[25, 50, 75, 100].map((ring) => (
        <polygon
          key={ring}
          className="seo-radar-ring"
          points={categoryLabels.map((_, i) => point(i, ring).join(",")).join(" ")}
        />
      ))}
      {categoryLabels.map((_, i) => {
        const [x, y] = point(i, 100);
        return <line key={i} className="seo-radar-axis" x1={c} y1={c} x2={x} y2={y} />;
      })}
      <polygon className="seo-radar-shape" points={shape} />
      {categoryLabels.map(({ key }, i) => {
        const [x, y] = point(i, drawn ? scores[key] : 0);
        return <circle key={key} className="seo-radar-dot" cx={x} cy={y} r={3.5} />;
      })}
      {categoryLabels.map(({ key, short }, i) => {
        const [x, y] = point(i, 124);
        return (
          <text key={key} x={x} y={y} className="seo-radar-label" textAnchor="middle" dominantBaseline="middle">
            <tspan x={x} dy="-0.45em">
              {short}
            </tspan>
            <tspan x={x} dy="1.2em" className="seo-radar-value">
              {scores[key]}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Core Web Vitals tile — Lighthouse thresholds: ≥90 good, ≥50 needs   */
/* work, otherwise poor.                                               */
/* ------------------------------------------------------------------ */

const vitalShort: Record<string, string> = {
  "largest-contentful-paint": "LCP",
  "first-contentful-paint": "FCP",
  "cumulative-layout-shift": "CLS",
  "total-blocking-time": "TBT",
  "speed-index": "SI",
  interactive: "TTI",
};

export function rating(score: number | null) {
  if (score === null) return { label: "No data", tone: "none" };
  if (score >= 90) return { label: "Good", tone: "good" };
  if (score >= 50) return { label: "Needs work", tone: "ok" };
  return { label: "Poor", tone: "poor" };
}

export function VitalTile({ vital }: { vital: PageSpeedVital }) {
  const r = rating(vital.score);
  return (
    <div className={`seo-vital seo-vital--${r.tone}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="seo-vital-short">{vitalShort[vital.id] ?? vital.id}</span>
        <span className="seo-vital-rating">{r.label}</span>
      </div>
      <p className="seo-vital-value">{vital.displayValue || "—"}</p>
      <p className="seo-vital-title">{vital.title}</p>
    </div>
  );
}
