// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

"use client";

/* ------------------------------------------------------------------ */
/* AGENT UI — interactive pieces shared by every agent tool:           */
/* step-by-step loading, radial score gauge, count-up numbers,         */
/* score bars and copy buttons. All use the --agent-* variables.       */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import { Check, Copy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------------------------------------------------------------- */
/* Count-up number                                                   */
/* ---------------------------------------------------------------- */

export function CountUp({ value, duration = 1100 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Reduced motion: jump straight to the value on the first frame.
    const ms = prefersReducedMotion() ? 0 : duration;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = ms === 0 ? 1 : Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{shown}</>;
}

/* ---------------------------------------------------------------- */
/* Radial gauge — a 270° arc with the value counting up in the middle */
/* ---------------------------------------------------------------- */

export function ScoreGauge({
  value,
  max = 100,
  label,
  size = 200,
}: {
  value: number;
  max?: number;
  /** Small text under the number, e.g. "out of 100". */
  label?: string;
  size?: number;
}) {
  const gradientId = useId();
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const radius = 80;
  const arc = 2 * Math.PI * radius * 0.75;
  const pct = Math.max(0, Math.min(1, value / max));

  return (
    <div className="jk-gauge" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" role="img" aria-label={`${value} out of ${max}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: "var(--agent-accent)" }} />
            <stop offset="100%" style={{ stopColor: "var(--agent-accent-bright)" }} />
          </linearGradient>
        </defs>
        <circle
          className="jk-gauge-track"
          cx="100"
          cy="100"
          r={radius}
          strokeDasharray={`${arc} ${2 * Math.PI * radius}`}
          transform="rotate(135 100 100)"
        />
        <circle
          className="jk-gauge-value"
          cx="100"
          cy="100"
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeDasharray={`${arc} ${2 * Math.PI * radius}`}
          strokeDashoffset={drawn ? arc * (1 - pct) : arc}
          transform="rotate(135 100 100)"
        />
      </svg>
      <div className="jk-gauge-center" aria-hidden="true">
        <span className="jk-gauge-number">
          <CountUp value={Math.round(value)} />
        </span>
        {label && <span className="jk-gauge-label">{label}</span>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Score bar with optional evidence text                             */
/* ---------------------------------------------------------------- */

export function ScoreBar({
  label,
  value,
  max,
  children,
}: {
  label: string;
  value: number;
  max: number;
  children?: React.ReactNode;
}) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="jk-bar">
      <div className="jk-bar-head">
        <span className="jk-bar-label">{label}</span>
        <span className="jk-bar-value">
          <strong>{value}</strong>/{max}
        </span>
      </div>
      <div
        className="jk-bar-track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <span className="jk-bar-fill" style={{ width: drawn ? `${pct}%` : 0 }} />
      </div>
      {children && <div className="jk-bar-body">{children}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Step-by-step loading — advances on a timer while the request runs */
/* and holds on the last step until the result arrives.              */
/* ---------------------------------------------------------------- */

export function LoadingSteps({ steps, interval = 1800 }: { steps: string[]; interval?: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => Math.min(i + 1, steps.length - 1));
    }, interval);
    return () => window.clearInterval(id);
  }, [steps.length, interval]);

  const pct = ((active + 0.5) / steps.length) * 100;

  return (
    <div className="jk-loading" role="status" aria-live="polite">
      <p className="jk-sr">{steps[active]}…</p>
      <div className="jk-loading-track" aria-hidden="true">
        <span className="jk-loading-fill" style={{ width: `${pct}%` }} />
      </div>
      <ol
        className="jk-loading-steps"
        style={{ "--steps": steps.length } as React.CSSProperties}
        aria-hidden="true"
      >
        {steps.map((step, i) => {
          const state = i < active ? "done" : i === active ? "current" : "todo";
          return (
            <li key={step} className={`jk-loading-step is-${state}`}>
              <span className="jk-loading-dot">{state === "done" ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
              <span className="jk-loading-label">{step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Copy button                                                       */
/* ---------------------------------------------------------------- */

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard blocked (e.g. insecure context) — nothing to do. */
    }
  };

  return (
    <button type="button" className={`jk-copy${copied ? " is-copied" : ""}`} onClick={copy}>
      {copied ? <Check size={15} strokeWidth={2.4} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
