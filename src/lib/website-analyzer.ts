import * as cheerio from "cheerio";

export type WebsiteData = {
  url: string;

  title: string;
  titleLength: number;

  description: string;
  descriptionLength: number;

  canonical: string;

  robots: {
    exists: boolean;
    content: string;
    noindex: boolean;
    nofollow: boolean;
  };

  robotsTxt: {
    accessible: boolean;
    content: string;
  };

  lang: string;

  h1: string[];
  h2: string[];

  headingIssues: {
    multipleH1: boolean;
    missingH1: boolean;
    skippedLevels: boolean;
  };

  images: {
    src: string;
    alt: string;
    hasAltAttribute: boolean;
    isDecorative: boolean;
    hasMeaningfulAlt: boolean;
    loading: string;
  }[];

  links: {
    text: string;
    href: string;
    internal: boolean;
    hasVisibleText: boolean;
    hasAccessibleName: boolean;
  }[];

  forms: {
    action: string;
    method: string;
    inputs: number;
    inputsWithoutLabels: number;
  }[];

  buttons: {
    text: string;
    hasAccessibleName: boolean;
  }[];

  scripts: number;

  wordCount: number;

  hasViewport: boolean;
  viewportContent: string;

  hasFavicon: boolean;
  hasAppleTouchIcon: boolean;

  hasOpenGraph: boolean;

  structuredData: {
    exists: boolean;
    jsonLdCount: number;
    types: string[];
  };

  htmlLength: number;
  htmlSizeKB: number;
};

function normalizeText(
  value: string | undefined | null
) {
  return (value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveUrl(
  baseUrl: string,
  value: string
) {
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return value;
  }
}

/*
|--------------------------------------------------------------------------
| ACCESSIBLE NAME
|--------------------------------------------------------------------------
|
| We intentionally use `any` here.
| Cheerio's element types differ between versions, while we only need
| Cheerio's selector/attribute methods inside this helper.
|
*/

function getAccessibleName(
  $: cheerio.CheerioAPI,
  element: any
) {
  const node = $(element);

  /*
   * 1. aria-label
   */
  const ariaLabel = normalizeText(
    node.attr("aria-label")
  );

  if (ariaLabel) {
    return ariaLabel;
  }

  /*
   * 2. aria-labelledby
   */
  const labelledBy = normalizeText(
    node.attr("aria-labelledby")
  );

  if (labelledBy) {
    const ids = labelledBy.split(/\s+/);

    const labelledText = ids
      .map((id) =>
        normalizeText(
          $(`#${id}`).text()
        )
      )
      .filter(Boolean)
      .join(" ");

    if (labelledText) {
      return labelledText;
    }
  }

  /*
   * 3. title attribute
   */
  const title = normalizeText(
    node.attr("title")
  );

  if (title) {
    return title;
  }

  /*
   * 4. Visible text
   */
  const visibleText = normalizeText(
    node.text()
  );

  if (visibleText) {
    return visibleText;
  }

  /*
   * 5. Image alt inside link/button
   */
  const imageAlt = normalizeText(
    node
      .find("img")
      .first()
      .attr("alt")
  );

  if (imageAlt) {
    return imageAlt;
  }

  /*
   * 6. SVG aria-label
   */
  const svgAriaLabel = normalizeText(
    node
      .find("svg")
      .first()
      .attr("aria-label")
  );

  if (svgAriaLabel) {
    return svgAriaLabel;
  }

  /*
   * 7. SVG title
   */
  const svgTitle = normalizeText(
    node
      .find("svg title")
      .first()
      .text()
  );

  if (svgTitle) {
    return svgTitle;
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| ROBOTS.TXT
|--------------------------------------------------------------------------
*/

async function fetchRobotsTxt(
  baseUrl: string
) {
  try {
    const origin =
      new URL(baseUrl).origin;

    const robotsUrl =
      `${origin}/robots.txt`;

    const response = await fetch(
      robotsUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AIPlannerBot/1.0; +https://aiplanner.jaseir.com)",
        },
        redirect: "follow",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        accessible: false,
        content: "",
      };
    }

    const content =
      await response.text();

    return {
      accessible: true,
      content: content.slice(
        0,
        10000
      ),
    };
  } catch {
    return {
      accessible: false,
      content: "",
    };
  }
}

/*
|--------------------------------------------------------------------------
| FAVICON DETECTION
|--------------------------------------------------------------------------
*/

async function detectFavicon(
  $: cheerio.CheerioAPI,
  baseUrl: string
) {
  /*
   * Check HTML declarations first.
   */
  const faviconLinks = $(
    'link[rel~="icon"], ' +
      'link[rel~="shortcut"], ' +
      'link[rel~="mask-icon"], ' +
      'link[rel~="apple-touch-icon"], ' +
      'link[rel~="apple-touch-icon-precomposed"]'
  );

  if (faviconLinks.length > 0) {
    return true;
  }

  /*
   * Fallback:
   * Many websites serve /favicon.ico without declaring it in HTML.
   */
  try {
    const origin =
      new URL(baseUrl).origin;

    const faviconUrl =
      `${origin}/favicon.ico`;

    const response = await fetch(
      faviconUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AIPlannerBot/1.0; +https://aiplanner.jaseir.com)",
        },
        redirect: "follow",
        cache: "no-store",
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| STRUCTURED DATA
|--------------------------------------------------------------------------
*/

function extractStructuredData(
  $: cheerio.CheerioAPI
) {
  const types: string[] = [];

  let jsonLdCount = 0;

  $(
    'script[type="application/ld+json"]'
  ).each((_, element) => {
    const raw = $(element).html();

    if (!raw) {
      return;
    }

    try {
      const parsed =
        JSON.parse(raw);

      jsonLdCount++;

      const collectTypes = (
        value: unknown
      ) => {
        if (
          !value ||
          typeof value !== "object"
        ) {
          return;
        }

        /*
         * Arrays
         */
        if (Array.isArray(value)) {
          value.forEach(
            collectTypes
          );

          return;
        }

        const obj =
          value as Record<
            string,
            unknown
          >;

        /*
         * @type
         */
        if (
          typeof obj["@type"] ===
          "string"
        ) {
          types.push(
            obj["@type"]
          );
        }

        /*
         * @graph
         */
        if (
          Array.isArray(
            obj["@graph"]
          )
        ) {
          obj["@graph"].forEach(
            collectTypes
          );
        }
      };

      collectTypes(parsed);
    } catch {
      /*
       * Invalid JSON-LD is ignored.
       */
    }
  });

  return {
    exists:
      jsonLdCount > 0,

    jsonLdCount,

    types: [
      ...new Set(types),
    ],
  };
}

/*
|--------------------------------------------------------------------------
| MAIN WEBSITE ANALYZER
|--------------------------------------------------------------------------
*/

export async function analyzeWebsite(
  url: string
): Promise<WebsiteData> {
  /*
   * Fetch website
   */
  const response = await fetch(
    url,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AIPlannerBot/1.0; +https://aiplanner.jaseir.com)",
      },
      redirect: "follow",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Website returned HTTP ${response.status}`
    );
  }

  const html =
    await response.text();

  const $ =
    cheerio.load(html);

  const finalUrl =
    response.url || url;

  /*
  |--------------------------------------------------------------------------
  | BASIC SEO
  |--------------------------------------------------------------------------
  */

  const title =
    normalizeText(
      $("title")
        .first()
        .text()
    );

  const description =
    normalizeText(
      $(
        'meta[name="description"]'
      ).attr("content")
    );

  const canonical =
    normalizeText(
      $(
        'link[rel="canonical"]'
      ).attr("href")
    );

  /*
  |--------------------------------------------------------------------------
  | ROBOTS META
  |--------------------------------------------------------------------------
  */

  const robotsContent =
    normalizeText(
      $(
        'meta[name="robots"]'
      ).attr("content")
    );

  const robots = {
    exists:
      robotsContent.length > 0,

    content:
      robotsContent,

    noindex:
      /\bnoindex\b/i.test(
        robotsContent
      ),

    nofollow:
      /\bnofollow\b/i.test(
        robotsContent
      ),
  };

  /*
  |--------------------------------------------------------------------------
  | LANGUAGE
  |--------------------------------------------------------------------------
  */

  const lang =
    normalizeText(
      $("html").attr("lang")
    );

  /*
  |--------------------------------------------------------------------------
  | HEADINGS
  |--------------------------------------------------------------------------
  */

  const h1 =
    $("h1")
      .map((_, element) =>
        normalizeText(
          $(element).text()
        )
      )
      .get()
      .filter(Boolean);

  const h2 =
    $("h2")
      .map((_, element) =>
        normalizeText(
          $(element).text()
        )
      )
      .get()
      .filter(Boolean);

  /*
   * Detect heading hierarchy
   */
  const allHeadingLevels: number[] =
    [];

  $("h1,h2,h3,h4,h5,h6").each(
    (_, element) => {
      const tag =
        element.tagName.toLowerCase();

      const level =
        Number(
          tag.replace(
            "h",
            ""
          )
        );

      if (
        level >= 1 &&
        level <= 6
      ) {
        allHeadingLevels.push(
          level
        );
      }
    }
  );

  let skippedLevels =
    false;

  for (
    let i = 1;
    i <
    allHeadingLevels.length;
    i++
  ) {
    const previous =
      allHeadingLevels[i - 1];

    const current =
      allHeadingLevels[i];

    if (
      current >
      previous + 1
    ) {
      skippedLevels = true;

      break;
    }
  }

  const headingIssues = {
    multipleH1:
      h1.length > 1,

    missingH1:
      h1.length === 0,

    skippedLevels,
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGES
  |--------------------------------------------------------------------------
  */

  const images =
    $("img")
      .map((_, element) => {
        const node =
          $(element);

        const altAttribute =
          node.attr("alt");

        const hasAltAttribute =
          altAttribute !==
          undefined;

        const alt =
          normalizeText(
            altAttribute
          );

        /*
         * alt="" is valid for decorative images.
         */
        const isDecorative =
          hasAltAttribute &&
          alt === "";

        const hasMeaningfulAlt =
          hasAltAttribute &&
          alt.length > 0;

        return {
          src: resolveUrl(
            finalUrl,
            normalizeText(
              node.attr("src")
            )
          ),

          alt,

          hasAltAttribute,

          isDecorative,

          hasMeaningfulAlt,

          loading:
            normalizeText(
              node.attr(
                "loading"
              )
            ).toLowerCase(),
        };
      })
      .get();

  /*
  |--------------------------------------------------------------------------
  | LINKS
  |--------------------------------------------------------------------------
  */

  const links =
    $("a")
      .map((_, element) => {
        const node =
          $(element);

        const href =
          normalizeText(
            node.attr("href")
          );

        const text =
          normalizeText(
            node.text()
          );

        const accessibleName =
          getAccessibleName(
            $,
            element
          );

        let internal =
          false;

        try {
          if (href) {
            const linkUrl =
              new URL(
                href,
                finalUrl
              );

            const siteUrl =
              new URL(
                finalUrl
              );

            internal =
              linkUrl.hostname ===
              siteUrl.hostname;
          }
        } catch {
          internal = false;
        }

        return {
          text,

          href,

          internal,

          hasVisibleText:
            text.length > 0,

          hasAccessibleName:
            accessibleName.length >
            0,
        };
      })
      .get();

  /*
  |--------------------------------------------------------------------------
  | FORMS
  |--------------------------------------------------------------------------
  */

  const forms =
    $("form")
      .map((_, element) => {
        const form =
          $(element);

        const inputs =
          form.find(
            "input, select, textarea"
          );

        let inputsWithoutLabels =
          0;

        inputs.each(
          (_, input) => {
            const node =
              $(input);

            const type =
              normalizeText(
                node.attr(
                  "type"
                )
              ).toLowerCase();

            /*
             * Hidden fields don't require labels.
             */
            if (
              type ===
              "hidden"
            ) {
              return;
            }

            const id =
              normalizeText(
                node.attr("id")
              );

            const ariaLabel =
              normalizeText(
                node.attr(
                  "aria-label"
                )
              );

            const ariaLabelledBy =
              normalizeText(
                node.attr(
                  "aria-labelledby"
                )
              );

            let hasLabel =
              false;

            /*
             * ARIA label
             */
            if (
              ariaLabel ||
              ariaLabelledBy
            ) {
              hasLabel = true;
            }

            /*
             * label[for="..."]
             */
            if (id) {
              const escapedId =
                id.replace(
                  /"/g,
                  '\\"'
                );

              const label =
                $(
                  `label[for="${escapedId}"]`
                );

              if (
                label.length >
                0
              ) {
                hasLabel = true;
              }
            }

            /*
             * Input nested inside label
             */
            if (
              node.closest(
                "label"
              ).length > 0
            ) {
              hasLabel = true;
            }

            if (
              !hasLabel
            ) {
              inputsWithoutLabels++;
            }
          }
        );

        return {
          action:
            resolveUrl(
              finalUrl,
              normalizeText(
                form.attr(
                  "action"
                )
              )
            ),

          method:
            normalizeText(
              form.attr(
                "method"
              )
            ).toUpperCase() ||
            "GET",

          inputs:
            inputs.length,

          inputsWithoutLabels,
        };
      })
      .get();

  /*
  |--------------------------------------------------------------------------
  | BUTTONS
  |--------------------------------------------------------------------------
  */

  const buttons =
    $(
      "button, input[type='button'], input[type='submit']"
    )
      .map((_, element) => {
        const node =
          $(element);

        let text =
          getAccessibleName(
            $,
            element
          );

        /*
         * input buttons use value
         */
        if (!text) {
          text =
            normalizeText(
              node.attr(
                "value"
              )
            );
        }

        return {
          text,

          hasAccessibleName:
            text.length > 0,
        };
      })
      .get();

  /*
  |--------------------------------------------------------------------------
  | SCRIPT COUNT
  |--------------------------------------------------------------------------
  */

  const scripts =
    $("script").length;

  /*
  |--------------------------------------------------------------------------
  | WORD COUNT
  |--------------------------------------------------------------------------
  */

  const bodyText =
    normalizeText(
      $("body").text()
    );

  const wordCount =
    bodyText
      ? bodyText.split(
          /\s+/
        ).length
      : 0;

  /*
  |--------------------------------------------------------------------------
  | VIEWPORT
  |--------------------------------------------------------------------------
  */

  const viewportContent =
    normalizeText(
      $(
        'meta[name="viewport"]'
      ).attr("content")
    );

  const hasViewport =
    viewportContent.length >
    0;

  /*
  |--------------------------------------------------------------------------
  | FAVICON
  |--------------------------------------------------------------------------
  */

  const hasAppleTouchIcon =
    $(
      'link[rel="apple-touch-icon"], ' +
        'link[rel="apple-touch-icon-precomposed"]'
    ).length > 0;

  const hasFavicon =
    await detectFavicon(
      $,
      finalUrl
    );

  /*
  |--------------------------------------------------------------------------
  | OPEN GRAPH
  |--------------------------------------------------------------------------
  */

  const hasOpenGraph =
    $(
      'meta[property^="og:"]'
    ).length > 0;

  /*
  |--------------------------------------------------------------------------
  | STRUCTURED DATA
  |--------------------------------------------------------------------------
  */

  const structuredData =
    extractStructuredData($);

  /*
  |--------------------------------------------------------------------------
  | ROBOTS.TXT
  |--------------------------------------------------------------------------
  */

  const robotsTxt =
    await fetchRobotsTxt(
      finalUrl
    );

  /*
  |--------------------------------------------------------------------------
  | HTML SIZE
  |--------------------------------------------------------------------------
  */

  const htmlLength =
    html.length;

  const htmlSizeKB =
    Math.round(
      (
        Buffer.byteLength(
          html,
          "utf8"
        ) / 1024
      ) * 10
    ) / 10;

  /*
  |--------------------------------------------------------------------------
  | RETURN
  |--------------------------------------------------------------------------
  */

  return {
    url: finalUrl,

    title,
    titleLength:
      title.length,

    description,
    descriptionLength:
      description.length,

    canonical,

    robots,

    robotsTxt,

    lang,

    h1,
    h2,

    headingIssues,

    images,

    links,

    forms,

    buttons,

    scripts,

    wordCount,

    hasViewport,

    viewportContent,

    hasFavicon,

    hasAppleTouchIcon,

    hasOpenGraph,

    structuredData,

    htmlLength,

    htmlSizeKB,
  };
}