export type PageSpeedFinding = {
  title: string;
  description: string;
  impact: string;
  category: string;
  priority: "High" | "Medium" | "Low";
};

export type PageSpeedVital = {
  id: string;
  title: string;
  displayValue: string;
  score: number | null;
};

export type PageSpeedStrategyResult = {
  strategy: "mobile" | "desktop";
  performance: number | null;
  accessibility: number | null;
  seo: number | null;
  bestPractices: number | null;
  vitals: PageSpeedVital[];
  fieldCategory: string | null;
};

export type PageSpeedData = {
  available: boolean;
  error: string | null;
  mobile: PageSpeedStrategyResult | null;
  desktop: PageSpeedStrategyResult | null;
  findings: PageSpeedFinding[];
};

type LighthouseAudit = {
  id?: string;
  title?: string;
  description?: string;
  displayValue?: string;
  score?: number | null;
  scoreDisplayMode?: string;
};

type PagespeedApiResponse = {
  error?: { message?: string };
  loadingExperience?: {
    overall_category?: string;
  };
  lighthouseResult?: {
    categories?: Record<
      string,
      {
        score?: number | null;
      }
    >;
    audits?: Record<string, LighthouseAudit>;
  };
};

const VITAL_IDS = [
  "largest-contentful-paint",
  "first-contentful-paint",
  "cumulative-layout-shift",
  "total-blocking-time",
  "speed-index",
  "interactive",
] as const;

const OPPORTUNITY_IDS = [
  "render-blocking-resources",
  "unused-javascript",
  "unused-css-rules",
  "uses-responsive-images",
  "offscreen-images",
  "unminified-javascript",
  "unminified-css",
  "server-response-time",
  "uses-text-compression",
  "modern-image-formats",
  "efficient-animated-content",
  "uses-optimized-images",
] as const;

function toScore(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function priorityFromScore(score: number | null): "High" | "Medium" | "Low" {
  if (score === null || score < 0.5) return "High";
  if (score < 0.9) return "Medium";
  return "Low";
}

function parseStrategy(
  payload: PagespeedApiResponse,
  strategy: "mobile" | "desktop"
): PageSpeedStrategyResult | null {
  const lighthouse = payload.lighthouseResult;

  if (!lighthouse) {
    return null;
  }

  const categories = lighthouse.categories || {};
  const audits = lighthouse.audits || {};

  const vitals: PageSpeedVital[] = VITAL_IDS.map((id) => {
    const audit = audits[id];

    return {
      id,
      title: audit?.title || id,
      displayValue: audit?.displayValue || "n/a",
      score:
        typeof audit?.score === "number" ? toScore(audit.score) : null,
    };
  });

  return {
    strategy,
    performance: toScore(categories.performance?.score),
    accessibility: toScore(categories.accessibility?.score),
    seo: toScore(categories.seo?.score),
    bestPractices: toScore(categories["best-practices"]?.score),
    vitals,
    fieldCategory: payload.loadingExperience?.overall_category || null,
  };
}

function findingsFromPayload(
  payload: PagespeedApiResponse,
  strategy: "mobile" | "desktop"
): PageSpeedFinding[] {
  const audits = payload.lighthouseResult?.audits || {};
  const findings: PageSpeedFinding[] = [];

  for (const id of OPPORTUNITY_IDS) {
    const audit = audits[id];

    if (!audit) continue;

    if (
      typeof audit.score !== "number" ||
      audit.score >= 0.9 ||
      audit.scoreDisplayMode === "notApplicable" ||
      audit.scoreDisplayMode === "informative"
    ) {
      continue;
    }

    const title = audit.title || id;
    const display = audit.displayValue ? ` ${audit.displayValue}.` : "";

    findings.push({
      title: `${title} (${strategy})`,
      description: `${stripHtml(audit.description || title)}.${display}`,
      impact:
        "This finding comes from Google PageSpeed Insights / Lighthouse lab data for the audited URL.",
      category: "Performance",
      priority: priorityFromScore(audit.score),
    });
  }

  return findings;
}

async function fetchStrategy(
  url: string,
  apiKey: string,
  strategy: "mobile" | "desktop"
): Promise<PagespeedApiResponse> {
  const params = new URLSearchParams({
    url,
    key: apiKey,
    strategy,
  });

  for (const category of [
    "PERFORMANCE",
    "ACCESSIBILITY",
    "BEST_PRACTICES",
    "SEO",
  ]) {
    params.append("category", category);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50000);

  try {
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      }
    );

    const payload = (await response.json()) as PagespeedApiResponse;

    if (!response.ok) {
      throw new Error(
        payload.error?.message ||
          `PageSpeed API returned HTTP ${response.status}`
      );
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzePageSpeed(url: string): Promise<PageSpeedData> {
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    return {
      available: false,
      error: "PAGESPEED_API_KEY is not configured.",
      mobile: null,
      desktop: null,
      findings: [],
    };
  }

  try {
    const [mobileResult, desktopResult] = await Promise.allSettled([
      fetchStrategy(url, apiKey, "mobile"),
      fetchStrategy(url, apiKey, "desktop"),
    ]);

    const mobilePayload =
      mobileResult.status === "fulfilled" ? mobileResult.value : null;
    const desktopPayload =
      desktopResult.status === "fulfilled" ? desktopResult.value : null;

    const mobile = mobilePayload
      ? parseStrategy(mobilePayload, "mobile")
      : null;
    const desktop = desktopPayload
      ? parseStrategy(desktopPayload, "desktop")
      : null;

    if (!mobile && !desktop) {
      const reason =
        mobileResult.status === "rejected"
          ? mobileResult.reason instanceof Error
            ? mobileResult.reason.message
            : "PageSpeed request failed."
          : "PageSpeed Insights returned no Lighthouse data.";

      return {
        available: false,
        error: reason,
        mobile: null,
        desktop: null,
        findings: [],
      };
    }

    const findings = [
      ...(mobilePayload ? findingsFromPayload(mobilePayload, "mobile") : []),
      ...(desktopPayload
        ? findingsFromPayload(desktopPayload, "desktop")
        : []),
    ]
      .sort((a, b) => {
        const weight = { High: 3, Medium: 2, Low: 1 };
        return weight[b.priority] - weight[a.priority];
      })
      .slice(0, 8);

    return {
      available: true,
      error: null,
      mobile,
      desktop,
      findings,
    };
  } catch (error) {
    return {
      available: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to retrieve PageSpeed Insights data.",
      mobile: null,
      desktop: null,
      findings: [],
    };
  }
}
