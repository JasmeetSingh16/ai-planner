// GENERATED — edit in dashboard/, then run scripts/sync-shared.mjs

"use client";

/* ------------------------------------------------------------------ */
/* SITE HEADER — one header for every Jaseir AI page.                  */
/* Sticky; gains a background + border once the page scrolls.          */
/* "AI Agents" opens a mega-menu built from lib/agents.ts.             */
/* SOURCE OF TRUTH: edit in dashboard/, then run                       */
/* `node scripts/sync-shared.mjs`.                                     */
/* ------------------------------------------------------------------ */

import { ArrowRight, ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import AgentIcon from "../agent/AgentIcon";
import { agents, agentVars, type AgentSlug } from "../../lib/agents";
import {
  ABOUT_URL,
  CONTACT_URL,
  LOGO_LIGHT_URL,
  LOGO_URL,
  MAIN_SITE_URL,
  SERVICES_URL,
  agentHref,
  hubHref,
  type SiteZone,
} from "../../lib/site";

/** Hub pages with a dark background get the dark header. */
const DARK_HUB_PATHS = ["/rag-knowledge-assistant", "/privacy", "/rag-debug"];

function unlockScroll() {
  document.documentElement.classList.remove("jk-scroll-lock");
}

export default function SiteHeader({ zone }: { zone: SiteZone }) {
  const pathname = usePathname() || "/";
  const onHome = zone.kind === "hub" && pathname === "/";
  const dark = zone.kind === "hub" && DARK_HUB_PATHS.some((p) => pathname.startsWith(p));

  const activeSlug: AgentSlug | undefined =
    zone.kind === "agent"
      ? zone.slug
      : agents.find((a) => a.host === "hub" && pathname.startsWith(a.path.replace(/\/$/, "")))?.slug;

  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const megaWrapRef = useRef<HTMLDivElement>(null);
  const megaButtonRef = useRef<HTMLButtonElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);
  const megaId = useId();
  const mobileId = useId();

  const howHref = hubHref(zone, "/#how-it-works", onHome);
  const workspaceHref = hubHref(zone, "/#agent-workspace", onHome);
  const hubHomeHref = hubHref(zone, "/");

  /* Background + border once the page has scrolled. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Mega-menu: close on outside click and on Escape. */
  useEffect(() => {
    if (!megaOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!megaWrapRef.current?.contains(e.target as Node)) setMegaOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        megaButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [megaOpen]);

  /* Mobile menu: lock page scroll, Escape closes, desktop resize closes. */
  const closeMobile = useCallback((returnFocus = false) => {
    unlockScroll();
    setMobileOpen(false);
    if (returnFocus) burgerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.documentElement.classList.add("jk-scroll-lock");
    mobileCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile(true);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && closeMobile();
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onChange);
    return () => {
      unlockScroll();
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
    };
  }, [mobileOpen, closeMobile]);

  /* Close menus after client-side navigation (state adjusted during render). */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMegaOpen(false);
    setMobileOpen(false);
  }

  const openOnHover = (open: boolean) => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      if (open) hoverOpenedAt.current = Date.now();
      setMegaOpen(open);
    }, open ? 60 : 160);
  };

  /* A click right after hover opened the menu should not close it again. */
  const onTriggerClick = () => {
    window.clearTimeout(hoverTimer.current);
    if (megaOpen && Date.now() - hoverOpenedAt.current < 500) return;
    setMegaOpen((v) => !v);
  };

  /* Unlock synchronously so an in-page "#anchor" link can still scroll. */
  const onMobileLinkClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) closeMobile();
  };

  const className = [
    "jk-header",
    dark ? "jk-header--dark" : "",
    scrolled || mobileOpen ? "is-scrolled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={className}>
      <div className="jk-header-inner">
        <div className="jk-brand">
          <a href={MAIN_SITE_URL} className="jk-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dark ? LOGO_LIGHT_URL : LOGO_URL} alt="Jaseir" width={132} height={52} />
          </a>
          <a href={hubHomeHref} className="jk-brand-tag" aria-label="Jaseir AI home">
            AI
          </a>
        </div>

        <nav className="jk-nav" aria-label="Main">
          <a href={SERVICES_URL} className="jk-nav-link">
            Services
          </a>

          <div
            className="jk-mega-wrap"
            ref={megaWrapRef}
            onMouseEnter={() => openOnHover(true)}
            onMouseLeave={() => openOnHover(false)}
            onBlur={(e) => {
              if (!megaWrapRef.current?.contains(e.relatedTarget as Node)) setMegaOpen(false);
            }}
          >
            <button
              ref={megaButtonRef}
              type="button"
              className={`jk-nav-link jk-nav-trigger${activeSlug ? " is-active" : ""}`}
              aria-expanded={megaOpen}
              aria-controls={megaId}
              onClick={onTriggerClick}
            >
              AI Agents
              <ChevronDown size={15} strokeWidth={2} aria-hidden="true" className="jk-chevron" />
            </button>

            <div id={megaId} className="jk-mega" hidden={!megaOpen}>
              <div className="jk-mega-intro">
                <p className="jk-eyebrow">AI Agents</p>
                <p className="jk-mega-title">Try any agent free. No sign-up.</p>
                <p className="jk-mega-text">
                  Each one does a single job well. When one fits, we build it into your stack.
                </p>
                <a href={workspaceHref} className="jk-mega-all" onClick={() => setMegaOpen(false)}>
                  Compare all agents
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              </div>

              <ul className="jk-mega-grid">
                {agents.map((agent) => {
                  const current = agent.slug === activeSlug;
                  return (
                    <li key={agent.slug}>
                      <a
                        href={agentHref(zone, agent)}
                        className={`jk-mega-item${current ? " is-current" : ""}`}
                        style={agentVars(agent)}
                        aria-current={current ? "page" : undefined}
                        onClick={() => setMegaOpen(false)}
                      >
                        <span className="jk-agent-badge">
                          <AgentIcon name={agent.icon} size={18} />
                        </span>
                        <span className="jk-mega-copy">
                          <span className="jk-mega-name">
                            {agent.shortName}
                            {current && <span className="jk-here">You are here</span>}
                          </span>
                          <span className="jk-mega-tagline">{agent.tagline}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <a href={howHref} className="jk-nav-link">
            How It Works
          </a>
          <a href={ABOUT_URL} className="jk-nav-link">
            About
          </a>
          <a href={CONTACT_URL} className="jk-nav-link">
            Contact
          </a>
        </nav>

        <div className="jk-header-actions">
          <a href={CONTACT_URL} className="jk-cta">
            Get Started
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <button
            ref={burgerRef}
            type="button"
            className="jk-burger"
            aria-expanded={mobileOpen}
            aria-controls={mobileId}
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ---------------- Mobile full-screen menu ---------------- */}
      <div
        id={mobileId}
        className="jk-mobile"
        hidden={!mobileOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        onClick={onMobileLinkClick}
      >
        <div className="jk-mobile-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_URL} alt="" width={116} height={46} />
          <button
            ref={mobileCloseRef}
            type="button"
            className="jk-burger jk-mobile-close"
            aria-label="Close menu"
            onClick={() => closeMobile(true)}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="jk-mobile-body">
          <p className="jk-eyebrow">AI Agents</p>
          <ul className="jk-mobile-agents">
            {agents.map((agent) => {
              const current = agent.slug === activeSlug;
              return (
                <li key={agent.slug}>
                  <a
                    href={agentHref(zone, agent)}
                    className={`jk-mobile-agent${current ? " is-current" : ""}`}
                    style={agentVars(agent)}
                    aria-current={current ? "page" : undefined}
                  >
                    <span className="jk-agent-badge">
                      <AgentIcon name={agent.icon} size={18} />
                    </span>
                    <span className="jk-mega-copy">
                      <span className="jk-mega-name">{agent.shortName}</span>
                      <span className="jk-mega-tagline">{agent.tagline}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          <ul className="jk-mobile-links">
            <li>
              <a href={SERVICES_URL}>Services</a>
            </li>
            <li>
              <a href={howHref}>How It Works</a>
            </li>
            <li>
              <a href={ABOUT_URL}>About</a>
            </li>
            <li>
              <a href={CONTACT_URL}>Contact</a>
            </li>
            <li>
              <a href={MAIN_SITE_URL}>
                jaseir.com <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </li>
          </ul>

          <a href={CONTACT_URL} className="jk-cta jk-cta--block">
            Get Started
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
