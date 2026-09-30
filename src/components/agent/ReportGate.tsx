// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

"use client";

/* ------------------------------------------------------------------ */
/* REPORT GATE — "Get your full report" form over the blurred rest of  */
/* an agent's report, and the booking CTA shown after the full report. */
/*                                                                     */
/* Submitting posts the lead to the dashboard (AGENT_LEADS_API), which */
/* saves it, emails the team and — when the report was sealed on the   */
/* server — returns the full report. Visitors who already unlocked one */
/* report are remembered in localStorage (best effort) and unlocked    */
/* automatically on the other agents.                                  */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import { ArrowRight, ArrowUpRight, LockKeyhole, TriangleAlert } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  AGENT_LEADS_API,
  gateCopy,
  validateGateLead,
  type GateLeadErrors,
  type GateLeadInput,
  type GatedAgent,
  type ReportGateInfo,
} from "../../lib/lead-gate";
import { GOOGLE_CLIENT_ID, bookingLinkProps, hubHref } from "../../lib/site";

const STORAGE_KEY = "jaseir:report-lead";

/* In-memory copy for when storage is blocked (private mode, etc.). */
let rememberedLead: GateLeadInput | null = null;

function loadLead(): GateLeadInput | null {
  if (rememberedLead) return rememberedLead;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<GateLeadInput>) : null;
    if (parsed && typeof parsed.name === "string" && typeof parsed.email === "string") {
      rememberedLead = { name: parsed.name, email: parsed.email, website: String(parsed.website ?? "") };
    }
  } catch {
    /* storage unavailable — the form still works */
  }
  return rememberedLead;
}

/** "Not you?": forget the visitor so the next report asks again. */
function forgetLead() {
  rememberedLead = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — nothing stored */
  }
}

function saveLead(lead: GateLeadInput) {
  rememberedLead = lead;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
  } catch {
    /* storage unavailable — remembered for this page only */
  }
}

type Status = "idle" | "auto" | "sending";

type UnlockResponse = {
  ok?: boolean;
  full?: unknown;
  errors?: GateLeadErrors;
  reason?: string;
  /** The saved name/email (for Google sign-in, the verified ones). */
  lead?: GateLeadInput;
};

/* ---------------- "Continue with Google" (Google Identity Services) ---------------- */

type GoogleId = {
  initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
};

let gsiScript: Promise<GoogleId> | null = null;

/** Loads Google's sign-in script once per page. */
function loadGoogle(): Promise<GoogleId> {
  gsiScript ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      const id = (window as unknown as { google?: { accounts?: { id?: GoogleId } } }).google?.accounts?.id;
      if (id) resolve(id);
      else reject(new Error("Google sign-in unavailable"));
    };
    script.onerror = () => {
      gsiScript = null;
      reject(new Error("Google sign-in script failed to load"));
    };
    document.head.appendChild(script);
  });
  return gsiScript;
}

/** Google's own button. Renders nothing when GOOGLE_CLIENT_ID is empty or Google can't load. */
function GoogleButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    callback.current = onCredential;
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGoogle().then(
      (google) => {
        if (cancelled || !ref.current) return;
        google.initialize({ client_id: GOOGLE_CLIENT_ID, callback: ({ credential }) => callback.current(credential) });
        google.renderButton(ref.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: Math.min(400, Math.max(200, ref.current.offsetWidth)),
        });
      },
      () => !cancelled && setFailed(true),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID || failed) return null;
  return (
    <>
      <div ref={ref} className="jk-gate-google" />
      <p className="jk-gate-or">
        <span>or</span>
      </p>
    </>
  );
}

export default function ReportGate({
  agent,
  gate,
  input,
  summary,
  onUnlock,
  children,
}: {
  agent: GatedAgent;
  gate: ReportGateInfo;
  /** What the visitor entered (used when the report isn't sealed). */
  input: string;
  /** Short description of their result (used when the report isn't sealed). */
  summary: string;
  /** Called with the full report (or null when the page already has it). */
  onUnlock: (full: unknown) => void;
  /** The locked part of the report, shown blurred behind the form. */
  children: ReactNode;
}) {
  const [form, setForm] = useState<GateLeadInput>({ name: "", email: "", website: "" });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<GateLeadErrors>({});
  const [message, setMessage] = useState("");
  // Remembered visitors skip the form: start in "auto" and unlock on mount.
  const [status, setStatus] = useState<Status>(() => (loadLead() ? "auto" : "idle"));
  const started = useRef(false);
  const id = useId();

  /** Posts the lead. No state changes here — see apply(). */
  async function request(lead: GateLeadInput, returning: boolean, googleCredential?: string): Promise<UnlockResponse> {
    try {
      const response = await fetch(AGENT_LEADS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          fax: honeypot,
          agent,
          token: gate.token,
          input,
          summary,
          pageUrl: window.location.href,
          returning,
          googleCredential,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as UnlockResponse;
      return response.ok ? data : { ...data, ok: false };
    } catch {
      return { ok: false };
    }
  }

  function apply(lead: GateLeadInput, data: UnlockResponse) {
    if (data.ok) {
      saveLead(data.lead?.email ? data.lead : lead);
      onUnlock(data.full ?? null);
      return;
    }
    setForm(lead);
    if (data.errors) setErrors(data.errors);
    setMessage(
      data.reason === "expired"
        ? gateCopy.expired
        : data.reason === "rate-limited"
          ? gateCopy.rateLimited
          : data.errors
            ? ""
            : gateCopy.error,
    );
    setStatus("idle");
  }

  /* Already unlocked on this or another agent: unlock straight away. */
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const lead = loadLead();
    if (lead) void request(lead, true).then((data) => apply(lead, data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lead = { name: form.name.trim(), email: form.email.trim(), website: form.website.trim() };
    const found = validateGateLead(lead);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = (["name", "email", "website"] as const).find((field) => found[field]);
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    setMessage("");
    void request(lead, false).then((data) => apply(lead, data));
  }

  function onGoogle(credential: string) {
    setStatus("sending");
    setMessage("");
    const lead = { ...form, website: form.website.trim() };
    void request(lead, false, credential).then((data) =>
      apply(lead, data.reason === "google" ? { ...data, reason: undefined } : data),
    );
  }

  const field = (name: keyof GateLeadInput, type: string, autoComplete: string, optional = false) => (
    <div className="jk-field">
      <label htmlFor={`${id}-${name}`} className="jk-label">
        {gateCopy.fields[name]}
        {optional && <small>{gateCopy.optional}</small>}
      </label>
      <input
        id={`${id}-${name}`}
        type={type}
        value={form[name]}
        onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
        placeholder={gateCopy.placeholders[name]}
        autoComplete={autoComplete}
        required={!optional}
        maxLength={name === "email" ? 254 : name === "website" ? 200 : 100}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
        className="jk-input"
      />
      {errors[name] && (
        <p id={`${id}-${name}-error`} className="jk-gate-field-error">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <section className="jk-gate" aria-labelledby={`${id}-title`}>
      <div className="jk-gate-locked" aria-hidden="true" inert>
        {children}
      </div>

      <div className="jk-gate-panel">
        <div className="jk-gate-card">
          <span className="jk-gate-icon" aria-hidden="true">
            <LockKeyhole size={20} />
          </span>
          <h3 id={`${id}-title`} className="jk-gate-title">
            {gateCopy.title}
          </h3>

          {status === "auto" ? (
            <p className="jk-gate-status" role="status">
              {gateCopy.unlocking}
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate className="jk-gate-form">
              <GoogleButton onCredential={onGoogle} />
              {field("name", "text", "name")}
              {field("email", "email", "email")}
              {field("website", "text", "url", true)}

              {/* Honeypot: hidden from people, bots fill it in. */}
              <div className="jk-gate-hp" aria-hidden="true">
                <label htmlFor={`${id}-fax`}>Fax</label>
                <input
                  id={`${id}-fax`}
                  name="fax"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                />
              </div>

              {message && (
                <p className="jk-error" role="alert">
                  <TriangleAlert size={18} aria-hidden="true" className="mt-px shrink-0" />
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="jk-btn jk-btn--primary jk-btn--lg jk-btn--block"
                disabled={status === "sending"}
              >
                {status === "sending" ? gateCopy.sending : gateCopy.submit}
                {status !== "sending" && <ArrowRight size={18} aria-hidden="true" />}
              </button>

              <p className="jk-fineprint">
                {gateCopy.consent}{" "}
                <a href={hubHref({ kind: "agent", slug: agent }, "/privacy/")} target="_blank" rel="noopener">
                  {gateCopy.privacyLabel}
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/** Shown after the full report: "Want this built…" + booking button, and "Not you?". */
export function ReportCta() {
  const [email, setEmail] = useState<string | null>(null);

  // Read after mount: the page may be rendered on the server, where there's no storage.
  useEffect(() => {
    const lead = loadLead();
    if (lead) queueMicrotask(() => setEmail(lead.email));
  }, []);

  return (
    <>
      <section className="jk-report-cta" aria-labelledby="jk-report-cta-title">
        <h3 id="jk-report-cta-title" className="jk-report-cta-title">
          {gateCopy.ctaTitle}
        </h3>
        <a {...bookingLinkProps} className="jk-btn jk-btn--primary jk-btn--lg">
          {gateCopy.ctaButton}
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </section>
      {email && (
        <p className="jk-report-who">
          Unlocked as {email} ·{" "}
          <button
            type="button"
            onClick={() => {
              forgetLead();
              setEmail(null);
            }}
          >
            Not you?
          </button>
        </p>
      )}
    </>
  );
}
