import { NextResponse } from "next/server";
import { z } from "zod";

import { groq } from "@/lib/groq";
import { analyzePageSpeed } from "@/lib/pagespeed";
import {
  analyzeWebsite,
  WebsiteData,
} from "@/lib/website-analyzer";

export const maxDuration = 60;
export const runtime = "nodejs";

const requestSchema = z.object({
  url: z.string().url(),
});

function clamp(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Poor";
}

/*
|--------------------------------------------------------------------------
| SEO SCORE
|--------------------------------------------------------------------------
*/

function calculateSeoScore(data: WebsiteData) {
  let score = 100;

  if (!data.title) score -= 20;

  if (
    data.titleLength > 0 &&
    (data.titleLength < 20 ||
      data.titleLength > 65)
  ) {
    score -= 5;
  }

  if (!data.description) {
    score -= 10;
  } else if (
    data.descriptionLength < 70 ||
    data.descriptionLength > 170
  ) {
    score -= 4;
  }

  if (!data.canonical) {
    score -= 5;
  }

  if (data.headingIssues.missingH1) {
    score -= 8;
  }

  if (data.headingIssues.multipleH1) {
    score -= 3;
  }

  /*
   * noindex is a serious SEO issue.
   * Missing robots meta is NOT an issue by itself.
   */
  if (data.robots.noindex) {
    score -= 35;
  }

  if (!data.hasOpenGraph) {
    score -= 3;
  }

  if (!data.structuredData.exists) {
    score -= 2;
  }

  return clamp(score);
}

/*
|--------------------------------------------------------------------------
| ACCESSIBILITY SCORE
|--------------------------------------------------------------------------
*/

function calculateAccessibilityScore(
  data: WebsiteData
) {
  let score = 100;

  /*
   * Decorative images with alt="" are valid.
   */
  const meaningfulImages =
    data.images.filter(
      (image) =>
        !image.isDecorative
    );

  const imagesWithoutMeaningfulAlt =
    meaningfulImages.filter(
      (image) =>
        !image.hasMeaningfulAlt
    ).length;

  if (
    meaningfulImages.length > 0
  ) {
    const ratio =
      imagesWithoutMeaningfulAlt /
      meaningfulImages.length;

    if (ratio > 0.5) {
      score -= 30;
    } else if (ratio > 0.25) {
      score -= 20;
    } else if (ratio > 0.1) {
      score -= 10;
    } else if (ratio > 0) {
      score -= 5;
    }
  }

  if (!data.hasViewport) {
    score -= 4;
  }

  /*
   * Form labels
   */
  const totalInputs =
    data.forms.reduce(
      (sum, form) =>
        sum + form.inputs,
      0
    );

  const unlabeledInputs =
    data.forms.reduce(
      (sum, form) =>
        sum +
        form.inputsWithoutLabels,
      0
    );

  if (totalInputs > 0) {
    const ratio =
      unlabeledInputs /
      totalInputs;

    if (ratio > 0.5) {
      score -= 25;
    } else if (ratio > 0.25) {
      score -= 15;
    } else if (ratio > 0) {
      score -= 7;
    }
  }

  /*
   * Accessible links
   */
  const inaccessibleLinks =
    data.links.filter(
      (link) =>
        !link.hasAccessibleName
    ).length;

  if (data.links.length > 0) {
    const ratio =
      inaccessibleLinks /
      data.links.length;

    if (ratio > 0.2) {
      score -= 15;
    } else if (ratio > 0.1) {
      score -= 8;
    } else if (ratio > 0) {
      score -= 4;
    }
  }

  /*
   * Missing language declaration
   */
  if (!data.lang) {
    score -= 3;
  }

  return clamp(score);
}

/*
|--------------------------------------------------------------------------
| UX SCORE
|--------------------------------------------------------------------------
*/

function calculateUxScore(
  data: WebsiteData
) {
  let score = 100;

  if (data.headingIssues.missingH1) {
    score -= 10;
  }

  if (data.headingIssues.multipleH1) {
    score -= 3;
  }

  if (data.wordCount < 100) {
    score -= 8;
  }

  if (data.links.length === 0) {
    score -= 5;
  }

  if (
    data.buttons.length === 0 &&
    data.forms.length === 0
  ) {
    score -= 5;
  }

  if (!data.hasViewport) {
    score -= 10;
  }

  return clamp(score);
}

/*
|--------------------------------------------------------------------------
| PERFORMANCE HEURISTIC
|--------------------------------------------------------------------------
|
| This is NOT Lighthouse or PageSpeed.
|--------------------------------------------------------------------------
*/

function calculatePerformanceScore(
  data: WebsiteData
) {
  let score = 100;

  /*
   * HTML size
   */
  if (data.htmlSizeKB > 1000) {
    score -= 30;
  } else if (data.htmlSizeKB > 700) {
    score -= 22;
  } else if (data.htmlSizeKB > 400) {
    score -= 14;
  } else if (data.htmlSizeKB > 200) {
    score -= 6;
  }

  /*
   * Script count
   */
  if (data.scripts > 120) {
    score -= 25;
  } else if (data.scripts > 90) {
    score -= 18;
  } else if (data.scripts > 70) {
    score -= 12;
  } else if (data.scripts > 50) {
    score -= 8;
  } else if (data.scripts > 30) {
    score -= 4;
  }

  /*
   * Images without explicit lazy loading.
   *
   * We do NOT say all images should be lazy-loaded.
   * Above-the-fold images may need eager loading.
   */
  const imagesWithoutLazyLoading =
    data.images.filter(
      (image) =>
        image.loading !== "lazy"
    ).length;

  if (
    imagesWithoutLazyLoading > 100
  ) {
    score -= 8;
  } else if (
    imagesWithoutLazyLoading > 50
  ) {
    score -= 5;
  } else if (
    imagesWithoutLazyLoading > 20
  ) {
    score -= 3;
  }

  return clamp(score);
}

/*
|--------------------------------------------------------------------------
| MOBILE SCORE
|--------------------------------------------------------------------------
*/

function calculateMobileScore(
  data: WebsiteData
) {
  let score = 100;

  if (!data.hasViewport) {
    score -= 50;
  }

  const viewport =
    data.viewportContent.toLowerCase();

  if (
    viewport &&
    !viewport.includes(
      "width=device-width"
    )
  ) {
    score -= 15;
  }

  return clamp(score);
}

/*
|--------------------------------------------------------------------------
| CONVERSION SCORE
|--------------------------------------------------------------------------
*/

function calculateConversionScore(
  data: WebsiteData
) {
  let score = 100;

  if (
    data.buttons.length === 0 &&
    data.forms.length === 0
  ) {
    score -= 20;
  }

  if (data.forms.length === 0) {
    score -= 5;
  }

  if (data.links.length < 3) {
    score -= 5;
  }

  if (data.wordCount < 150) {
    score -= 5;
  }

  return clamp(score);
}

/*
|--------------------------------------------------------------------------
| VERIFIED FINDINGS
|--------------------------------------------------------------------------
|
| These findings come from the analyzer, not AI.
|--------------------------------------------------------------------------
*/

function generateVerifiedFindings(
  data: WebsiteData
) {
  const findings: {
    title: string;
    description: string;
    impact: string;
    category: string;
    priority: "High" | "Medium" | "Low";
  }[] = [];

  /*
   * Performance
   */
  if (data.htmlSizeKB > 400) {
    findings.push({
      title:
        "Large HTML Document",

      description:
        `${data.htmlSizeKB} KB of HTML was detected.`,

      impact:
        "A larger document can increase transfer and parsing work, particularly on slower connections.",

      category:
        "Performance",

      priority:
        data.htmlSizeKB > 700
          ? "High"
          : "Medium",
    });
  }

  if (data.scripts > 70) {
    findings.push({
      title:
        "High Script Count",

      description:
        `${data.scripts} script elements were detected.`,

      impact:
        "A large JavaScript footprint can increase browser processing and page complexity.",

      category:
        "Performance",

      priority:
        data.scripts > 100
          ? "High"
          : "Medium",
    });
  }

  /*
   * Accessibility — links
   */
  const inaccessibleLinks =
    data.links.filter(
      (link) =>
        !link.hasAccessibleName
    ).length;

  if (inaccessibleLinks > 0) {
    findings.push({
      title:
        "Links Without Accessible Names",

      description:
        `${inaccessibleLinks} link${
          inaccessibleLinks === 1
            ? ""
            : "s"
        } have no visible text or detected accessible name.`,

      impact:
        "These links may be difficult for screen-reader users to understand or navigate.",

      category:
        "Accessibility",

      priority:
        inaccessibleLinks > 3
          ? "High"
          : "Medium",
    });
  }

  /*
   * Accessibility — forms
   */
  const unlabeledInputs =
    data.forms.reduce(
      (sum, form) =>
        sum +
        form.inputsWithoutLabels,
      0
    );

  if (unlabeledInputs > 0) {
    findings.push({
      title:
        "Form Inputs Without Labels",

      description:
        `${unlabeledInputs} form input${
          unlabeledInputs === 1
            ? ""
            : "s"
        } do not have a detected associated label or ARIA label.`,

      impact:
        "Unlabeled controls can make forms harder to understand and operate with assistive technologies.",

      category:
        "Accessibility",

      priority:
        unlabeledInputs > 3
          ? "High"
          : "Medium",
    });
  }

  /*
   * Heading structure
   */
  if (
    data.headingIssues.multipleH1
  ) {
    findings.push({
      title:
        "Multiple H1 Elements",

      description:
        `${data.h1.length} H1 elements were detected on the page.`,

      impact:
        "A clear heading structure can make page content easier to understand and navigate.",

      category:
        "SEO",

      priority:
        "Medium",
    });
  }

  if (
    data.headingIssues.skippedLevels
  ) {
    findings.push({
      title:
        "Skipped Heading Levels",

      description:
        "The heading structure contains one or more level jumps, such as H1 directly followed by H3.",

      impact:
        "Consistent heading hierarchy improves content structure and accessibility.",

      category:
        "Accessibility",

      priority:
        "Medium",
    });
  }

  /*
   * Missing meta description
   */
  if (!data.description) {
    findings.push({
      title:
        "Missing Meta Description",

      description:
        "No meta description was detected.",

      impact:
        "A useful description can help search engines understand the page and may be used as the search-result snippet.",

      category:
        "SEO",

      priority:
        "Medium",
    });
  }

  /*
   * Missing canonical
   */
  if (!data.canonical) {
    findings.push({
      title:
        "Missing Canonical URL",

      description:
        "No canonical link element was detected.",

      impact:
        "Canonicalization can help search engines understand the preferred URL when duplicate or similar pages exist.",

      category:
        "SEO",

      priority:
        "Low",
    });
  }

  /*
   * Noindex
   */
  if (data.robots.noindex) {
    findings.push({
      title:
        "Noindex Directive Detected",

      description:
        `The robots meta tag contains: ${data.robots.content}`,

      impact:
        "A noindex directive can prevent the page from appearing in search results.",

      category:
        "SEO",

      priority:
        "High",
    });
  }

  /*
   * Missing structured data
   */
  if (!data.structuredData.exists) {
    findings.push({
      title:
        "No JSON-LD Structured Data",

      description:
        "No JSON-LD structured data was detected in the page source.",

      impact:
        "Structured data can help search engines understand eligible content types and entities.",

      category:
        "SEO",

      priority:
        "Low",
    });
  }

  /*
   * Images
   */
  const imagesWithoutLazyLoading =
    data.images.filter(
      (image) =>
        image.loading !== "lazy"
    ).length;

  if (
    imagesWithoutLazyLoading > 20
  ) {
    findings.push({
      title:
        "Many Images Without Explicit Lazy Loading",

      description:
        `${imagesWithoutLazyLoading} of ${data.images.length} images do not specify loading="lazy".`,

      impact:
        "Below-the-fold images may benefit from deferred loading, reducing unnecessary work during initial page load.",

      category:
        "Performance",

      priority:
        imagesWithoutLazyLoading > 50
          ? "Medium"
          : "Low",
    });
  }

  return findings;
}

/*
|--------------------------------------------------------------------------
| FALLBACK AI CONTENT
|--------------------------------------------------------------------------
*/

function buildFallbackContent(
  findings: ReturnType<
    typeof generateVerifiedFindings
  >
) {
  const sorted =
    [...findings].sort(
      (a, b) => {
        const weight = {
          High: 3,
          Medium: 2,
          Low: 1,
        };

        return (
          weight[b.priority] -
          weight[a.priority]
        );
      }
    );

  const criticalIssues =
    sorted.slice(0, 5).map(
      (finding) => ({
        title:
          finding.title,

        description:
          finding.description,

        impact:
          finding.impact,
      })
    );

  const recommendations =
    sorted.slice(0, 6).map(
      (finding) => ({
        title:
          recommendationTitle(
            finding.title
          ),

        description:
          recommendationDescription(
            finding.title
          ),

        priority:
          finding.priority,
      })
    );

  const performanceFindings =
    sorted.filter(
      (finding) =>
        finding.category ===
        "Performance"
    );

  const accessibilityFindings =
    sorted.filter(
      (finding) =>
        finding.category ===
        "Accessibility"
    );

  const seoFindings =
    sorted.filter(
      (finding) =>
        finding.category ===
        "SEO"
    );

  const improvementPlan = [
    {
      week: "Week 1",
      focus:
        performanceFindings.length > 0
          ? "Performance"
          : "Technical Foundation",

      actions:
        performanceFindings.length > 0
          ? [
              "Review the largest HTML and JavaScript contributors.",
              "Remove or defer non-critical scripts.",
              "Measure real loading performance with PageSpeed Insights.",
            ]
          : [
              "Review the highest-priority audit findings.",
              "Confirm technical issues in the source code.",
              "Establish baseline performance measurements.",
            ],
    },

    {
      week: "Week 2",
      focus:
        accessibilityFindings.length > 0
          ? "Accessibility"
          : "SEO",

      actions:
        accessibilityFindings.length > 0
          ? [
              "Fix links without accessible names.",
              "Associate labels with form controls.",
              "Review heading structure with assistive technology considerations.",
            ]
          : [
              "Review metadata and canonicalization.",
              "Improve page structure.",
              "Validate structured data opportunities.",
            ],
    },

    {
      week: "Week 3",
      focus:
        seoFindings.length > 0
          ? "SEO"
          : "Performance",

      actions:
        seoFindings.length > 0
          ? [
              "Review title and meta description quality.",
              "Validate canonical URLs.",
              "Review search-facing structured data opportunities.",
            ]
          : [
              "Optimize non-critical assets.",
              "Review image loading strategy.",
              "Measure improvements using real performance testing.",
            ],
    },

    {
      week: "Week 4",
      focus:
        "Validation & Measurement",

      actions: [
        "Re-run the website audit.",
        "Run a Lighthouse or PageSpeed Insights test.",
        "Compare the new results against the baseline.",
      ],
    },
  ];

  return {
    summary:
      "The website has a strong overall technical foundation, with the main opportunities concentrated in the highest-priority findings identified by the audit. Addressing these issues and validating the results with real performance testing will provide the clearest improvement path.",

    criticalIssues,

    recommendations,

    improvementPlan,
  };
}

function recommendationTitle(
  title: string
) {
  if (
    title ===
    "Large HTML Document"
  ) {
    return "Reduce HTML Payload";
  }

  if (
    title ===
    "High Script Count"
  ) {
    return "Reduce Non-Critical JavaScript";
  }

  if (
    title ===
    "Many Images Without Explicit Lazy Loading"
  ) {
    return "Review Image Loading Strategy";
  }

  if (
    title ===
    "Links Without Accessible Names"
  ) {
    return "Add Accessible Link Names";
  }

  if (
    title ===
    "Form Inputs Without Labels"
  ) {
    return "Label Form Controls";
  }

  if (
    title ===
    "Multiple H1 Elements"
  ) {
    return "Review Heading Structure";
  }

  if (
    title ===
    "Skipped Heading Levels"
  ) {
    return "Correct Heading Hierarchy";
  }

  if (
    title ===
    "Missing Meta Description"
  ) {
    return "Add a Useful Meta Description";
  }

  if (
    title ===
    "Missing Canonical URL"
  ) {
    return "Review Canonicalization";
  }

  if (
    title ===
    "Noindex Directive Detected"
  ) {
    return "Review the Noindex Directive";
  }

  if (
    title ===
    "No JSON-LD Structured Data"
  ) {
    return "Review Structured Data Opportunities";
  }

  return "Review This Finding";
}

function recommendationDescription(
  title: string
) {
  if (
    title ===
    "Large HTML Document"
  ) {
    return "Identify unnecessary markup and reduce document size where practical.";
  }

  if (
    title ===
    "High Script Count"
  ) {
    return "Audit third-party and application scripts, then defer or remove non-critical JavaScript where appropriate.";
  }

  if (
    title ===
    "Many Images Without Explicit Lazy Loading"
  ) {
    return "Consider lazy-loading appropriate below-the-fold images while keeping critical above-the-fold images available immediately.";
  }

  if (
    title ===
    "Links Without Accessible Names"
  ) {
    return "Provide meaningful visible text or an appropriate accessible name using ARIA where necessary.";
  }

  if (
    title ===
    "Form Inputs Without Labels"
  ) {
    return "Associate each user-facing form control with a visible label or appropriate accessible labeling mechanism.";
  }

  if (
    title ===
    "Multiple H1 Elements"
  ) {
    return "Review the page hierarchy and use headings that accurately represent the content structure.";
  }

  if (
    title ===
    "Skipped Heading Levels"
  ) {
    return "Review heading levels so the document structure follows a logical hierarchy.";
  }

  if (
    title ===
    "Missing Meta Description"
  ) {
    return "Add a concise, accurate description that summarizes the page and gives search users useful context.";
  }

  if (
    title ===
    "Missing Canonical URL"
  ) {
    return "Add a canonical URL when appropriate, especially when multiple URLs can represent the same content.";
  }

  if (
    title ===
    "Noindex Directive Detected"
  ) {
    return "Confirm that the noindex directive is intentional before changing it.";
  }

  if (
    title ===
    "No JSON-LD Structured Data"
  ) {
    return "Review whether relevant structured data types could improve search-engine understanding of the page.";
  }

  return "Review the finding and validate the recommended change before implementation.";
}

/*
|--------------------------------------------------------------------------
| AI RESPONSE NORMALIZATION
|--------------------------------------------------------------------------
*/

function normalizeAiResult(
  aiResult: any,
  fallback: ReturnType<
    typeof buildFallbackContent
  >
) {
  const summary =
    typeof aiResult?.summary ===
    "string"
      ? aiResult.summary
      : fallback.summary;

  const criticalIssues =
    Array.isArray(
      aiResult?.criticalIssues
    )
      ? aiResult.criticalIssues
          .filter(
            (item: any) =>
              item &&
              typeof item.title ===
                "string" &&
              typeof item.description ===
                "string" &&
              typeof item.impact ===
                "string"
          )
          .slice(0, 5)
      : [];

  const recommendations =
    Array.isArray(
      aiResult?.recommendations
    )
      ? aiResult.recommendations
          .filter(
            (item: any) =>
              item &&
              typeof item.title ===
                "string" &&
              typeof item.description ===
                "string"
          )
          .map(
            (item: any) => ({
              title: item.title,
              description:
                item.description,
              priority:
                item.priority ===
                  "High" ||
                item.priority ===
                  "Medium" ||
                item.priority ===
                  "Low"
                  ? item.priority
                  : "Medium",
            })
          )
          .slice(0, 6)
      : [];

  const improvementPlan =
    Array.isArray(
      aiResult?.improvementPlan
    )
      ? aiResult.improvementPlan
          .filter(
            (item: any) =>
              item &&
              typeof item.week ===
                "string" &&
              typeof item.focus ===
                "string" &&
              Array.isArray(
                item.actions
              )
          )
          .map(
            (item: any) => ({
              week: item.week,
              focus: item.focus,
              actions:
                item.actions
                  .filter(
                    (action: any) =>
                      typeof action ===
                      "string"
                  )
                  .slice(0, 5),
            })
          )
          .filter(
            (item: any) =>
              item.actions.length > 0
          )
          .slice(0, 4)
      : [];

  /*
   * If AI returned incomplete data, use fallback
   * for that specific section.
   */
  return {
    summary,

    criticalIssues:
      criticalIssues.length > 0
        ? criticalIssues
        : fallback.criticalIssues,

    recommendations:
      recommendations.length > 0
        ? recommendations
        : fallback.recommendations,

    improvementPlan:
      improvementPlan.length >= 3
        ? improvementPlan
        : fallback.improvementPlan,
  };
}

/*
|--------------------------------------------------------------------------
| API ROUTE
|--------------------------------------------------------------------------
*/

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const parsed =
      requestSchema.safeParse(
        body
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid website URL.",
        },
        {
          status: 400,
        }
      );
    }

    const { url } =
      parsed.data;

    const [website, pageSpeed] =
      await Promise.all([
        analyzeWebsite(url),
        analyzePageSpeed(url),
      ]);

    /*
     * Deterministic HTML scores, with
     * PageSpeed replacing heuristic
     * performance when available.
     */
    const seo =
      calculateSeoScore(
        website
      );

    const ux =
      calculateUxScore(
        website
      );

    const accessibility =
      calculateAccessibilityScore(
        website
      );

    const heuristicPerformance =
      calculatePerformanceScore(
        website
      );

    const heuristicMobile =
      calculateMobileScore(
        website
      );

    const lighthousePerformance =
      pageSpeed.mobile?.performance ??
      pageSpeed.desktop?.performance;

    const performance =
      lighthousePerformance ??
      heuristicPerformance;

    const mobile =
      pageSpeed.mobile?.performance !=
      null
        ? clamp(
            heuristicMobile * 0.3 +
              pageSpeed.mobile
                .performance *
                0.7
          )
        : heuristicMobile;

    const conversion =
      calculateConversionScore(
        website
      );

    const overallScore =
      clamp(
        seo * 0.2 +
          ux * 0.18 +
          accessibility * 0.18 +
          performance * 0.16 +
          mobile * 0.14 +
          conversion * 0.14
      );

    /*
     * Generate verified findings.
     */
    const verifiedFindings = [
      ...generateVerifiedFindings(
        website
      ),
      ...pageSpeed.findings,
    ];

    /*
     * Always build fallback content.
     */
    const fallback =
      buildFallbackContent(
        verifiedFindings
      );

    /*
     * Compact data for Groq.
     */
    const compactData = {
      url: website.url,

      seo: {
        title:
          website.title,

        titleLength:
          website.titleLength,

        description:
          website.description,

        descriptionLength:
          website.descriptionLength,

        canonical:
          Boolean(
            website.canonical
          ),

        robots:
          website.robots,

        robotsTxt: {
          accessible:
            website.robotsTxt
              .accessible,
        },

        openGraph:
          website.hasOpenGraph,

        structuredData:
          website.structuredData,

        h1Count:
          website.h1.length,

        h2Count:
          website.h2.length,

        headingIssues:
          website.headingIssues,
      },

      accessibility: {
        images: {
          total:
            website.images.length,

          decorative:
            website.images.filter(
              (image) =>
                image.isDecorative
            ).length,

          missingMeaningfulAlt:
            website.images.filter(
              (image) =>
                !image.isDecorative &&
                !image.hasMeaningfulAlt
            ).length,
        },

        links: {
          total:
            website.links.length,

          withoutAccessibleName:
            website.links.filter(
              (link) =>
                !link.hasAccessibleName
            ).length,
        },

        forms:
          website.forms,

        language:
          website.lang,

        viewport: {
          exists:
            website.hasViewport,

          content:
            website.viewportContent,
        },
      },

      performance: {
        htmlSizeKB:
          website.htmlSizeKB,

        scriptCount:
          website.scripts,

        imageCount:
          website.images.length,

        imagesWithoutLazyLoading:
          website.images.filter(
            (image) =>
              image.loading !==
              "lazy"
          ).length,

        source: pageSpeed.available
          ? "pagespeed-insights"
          : "html-heuristic",
      },

      pageSpeed: {
        available:
          pageSpeed.available,

        error: pageSpeed.error,

        mobile: pageSpeed.mobile
          ? {
              performance:
                pageSpeed.mobile
                  .performance,
              accessibility:
                pageSpeed.mobile
                  .accessibility,
              seo: pageSpeed.mobile
                .seo,
              bestPractices:
                pageSpeed.mobile
                  .bestPractices,
              fieldCategory:
                pageSpeed.mobile
                  .fieldCategory,
              vitals:
                pageSpeed.mobile
                  .vitals,
            }
          : null,

        desktop: pageSpeed.desktop
          ? {
              performance:
                pageSpeed.desktop
                  .performance,
              accessibility:
                pageSpeed.desktop
                  .accessibility,
              seo: pageSpeed.desktop
                .seo,
              bestPractices:
                pageSpeed.desktop
                  .bestPractices,
              vitals:
                pageSpeed.desktop
                  .vitals,
            }
          : null,
      },

      conversion: {
        buttonCount:
          website.buttons.length,

        formCount:
          website.forms.length,

        internalLinkCount:
          website.links.filter(
            (link) =>
              link.internal
          ).length,
      },

      content: {
        wordCount:
          website.wordCount,
      },

      branding: {
        favicon:
          website.hasFavicon,

        appleTouchIcon:
          website.hasAppleTouchIcon,
      },
    };

    /*
     * AI prompt
     */
    const pageSpeedRules =
      pageSpeed.available
        ? `
You MAY cite Google PageSpeed Insights and Lighthouse lab data when it is present in the supplied pageSpeed object.

You MAY mention Core Web Vitals only when a specific metric value is supplied.

Do not invent Lighthouse scores, lab timings, or field-data categories.
`
        : `
DO NOT claim Lighthouse, PageSpeed Insights, Core Web Vitals, real load time, or physical-device testing.

Performance and mobile scores are heuristic estimates because PageSpeed data was unavailable.
`;

    const prompt = `
You are the AI explanation layer for Jaseir's AI Website Auditor.

You analyze VERIFIED website facts and explain the most useful improvements.

DO NOT invent findings.

DO NOT change the supplied scores.

DO NOT calculate scores.
${pageSpeedRules}
IMPORTANT:

- Missing robots meta is NOT a problem by itself.
- Only report noindex when the supplied data contains noindex.
- alt="" can be valid for decorative images.
- Do not say all images should be lazy-loaded.
- Above-the-fold images may appropriately remain eager.
- Do not claim performance issues directly cause search rankings to decrease.
- Do not recommend keyword stuffing.
- Meta descriptions should be accurate and useful.
- Only discuss link accessibility when the supplied data says the link has no accessible name.
- Only discuss form labeling when the supplied data says inputs lack labels.
- Prioritize high-impact performance and accessibility issues before low-impact SEO suggestions.
- Recommendations must be actionable.

VERIFIED FINDINGS:

${JSON.stringify(
  verifiedFindings,
  null,
  2
)}

WEBSITE DATA:

${JSON.stringify(
  compactData,
  null,
  2
)}

DETERMINISTIC SCORES:

SEO: ${seo}
UX: ${ux}
Accessibility: ${accessibility}
Performance: ${performance}
Mobile: ${mobile}
Conversion: ${conversion}
Overall: ${overallScore}

Return ONLY valid JSON:

{
  "summary": "2-3 sentence executive summary",
  "criticalIssues": [
    {
      "title": "Issue title",
      "description": "Evidence-based description",
      "impact": "Practical impact"
    }
  ],
  "recommendations": [
    {
      "title": "Recommendation",
      "description": "Specific implementation advice",
      "priority": "High"
    }
  ],
  "improvementPlan": [
    {
      "week": "Week 1",
      "focus": "Focus",
      "actions": [
        "Action 1",
        "Action 2",
        "Action 3"
      ]
    }
  ]
}

Requirements:

- Maximum 5 critical issues.
- Maximum 6 recommendations.
- Exactly 4 roadmap weeks.
- Each roadmap week must contain 2-4 actions.
- Priority must be High, Medium or Low.
`;

    let aiResult: any = null;

    /*
     * AI call
     */
    try {
      const completion =
        await groq.chat.completions.create(
          {
            model:
              "openai/gpt-oss-20b",

            temperature:
              0.1,

            max_tokens:
              2500,

            response_format: {
              type: "json_object",
            },

            messages: [
              {
                role:
                  "system",

                content:
                  "You are a precise website audit analyst. Use only verified evidence and always return complete JSON.",
              },
              {
                role:
                  "user",

                content:
                  prompt,
              },
            ],
          }
        );

      const raw =
        completion
          .choices[0]
          ?.message
          ?.content;

      if (raw) {
        try {
          aiResult =
            JSON.parse(raw);
        } catch {
          aiResult = null;
        }
      }
    } catch (aiError) {
      console.error(
        "Groq analysis error:",
        aiError
      );

      aiResult = null;
    }

    /*
     * Normalize AI result.
     *
     * Missing sections automatically receive
     * reliable deterministic fallback content.
     */
    const finalAi =
      normalizeAiResult(
        aiResult,
        fallback
      );

    /*
     * Return audit
     */
    const disclaimer = pageSpeed.available
      ? "Performance scores use Google PageSpeed Insights Lighthouse lab data. SEO, UX, accessibility and conversion scores come from HTML analysis of the page. Field data appears only when Chrome UX Report metrics are available for the URL."
      : "Performance and mobile scores are heuristic estimates based on available website signals because PageSpeed Insights data could not be retrieved. This audit does not represent a Lighthouse test unless PageSpeed data is present.";

    return NextResponse.json({
      success: true,

      website: {
        url: website.url,
        title: website.title,
        description: website.description,
      },

      audit: {
        url:
          website.url,

        overallScore,

        scoreLabel:
          getScoreLabel(
            overallScore
          ),

        scores: {
          seo,
          ux,
          accessibility,
          performance,
          mobile,
          conversion,
        },

        pageSpeed: {
          available: pageSpeed.available,
          error: pageSpeed.error,
          mobile: pageSpeed.mobile,
          desktop: pageSpeed.desktop,
        },

        summary:
          finalAi.summary,

        criticalIssues:
          finalAi.criticalIssues,

        recommendations:
          finalAi.recommendations,

        improvementPlan:
          finalAi.improvementPlan,

        technicalData: {
          htmlSizeKB:
            website.htmlSizeKB,

          scriptCount:
            website.scripts,

          imageCount:
            website.images.length,

          missingMeaningfulAlt:
            website.images.filter(
              (image) =>
                !image.isDecorative &&
                !image.hasMeaningfulAlt
            ).length,

          decorativeImages:
            website.images.filter(
              (image) =>
                image.isDecorative
            ).length,

          inaccessibleLinks:
            website.links.filter(
              (link) =>
                !link.hasAccessibleName
            ).length,

          unlabeledInputs:
            website.forms.reduce(
              (sum, form) =>
                sum +
                form.inputsWithoutLabels,
              0
            ),

          favicon:
            website.hasFavicon,

          robotsTxt:
            website.robotsTxt
              .accessible,

          structuredData:
            website.structuredData
              .exists,
        },

        disclaimer,
      },
    });
  } catch (error) {
    console.error(
      "Website audit error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to analyze website.",
      },
      {
        status: 500,
      }
    );
  }
}