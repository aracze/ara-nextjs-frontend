import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function getPayloadURL() {
  return (process.env.PAYLOAD_BASE_API_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

type RichTextRenderContext = {
  currencyCode?: string | null;
  exchangeRate?: number | null;
};

/**
 * Convert a Lexical rich text JSON tree to an HTML string.
 * Falls back to returning the value as-is if it's already a string.
 */
export function richTextToHtml(
  value: unknown,
  context: RichTextRenderContext = {},
): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const node = value as Record<string, unknown>;
  if ("root" in node) return richTextToHtml(node.root, context);

  const children = Array.isArray(node.children)
    ? (node.children as Record<string, unknown>[])
        .map((child) => richTextToHtml(child, context))
        .join("")
    : "";

  const type = node.type as string | undefined;

  // Text leaf node
  if (type === "text" || ("text" in node && typeof node.text === "string")) {
    let text = escapeHtml(node.text as string);
    const format = (node.format as number) ?? 0;
    if (format & 1) text = `<strong>${text}</strong>`;
    if (format & 2) text = `<em>${text}</em>`;
    if (format & 4) text = `<s>${text}</s>`;
    if (format & 8) text = `<u>${text}</u>`;
    if (format & 16) text = `<code>${text}</code>`;
    return text;
  }

  // Linebreak
  if (type === "linebreak") return "<br/>";

  // Block nodes
  switch (type) {
    case "table":
      return `<div class="rich-text-table-container"><table class="rich-text-table">${children}</table></div>`;
    case "tablerow":
      return `<tr class="rich-text-table-row">${children}</tr>`;
    case "tablecell": {
      const isHeader = (node.headerState as number) > 0;
      const tag = isHeader ? "th" : "td";
      const className = isHeader
        ? "rich-text-table-cell is-header"
        : "rich-text-table-cell";
      return `<${tag} class="${className}">${children}</${tag}>`;
    }
    case "paragraph":
      return `<p>${children}</p>`;
    case "heading": {
      const tag = (node.tag as string) || "h2";
      return `<${tag}>${children}</${tag}>`;
    }
    case "quote":
      return `<blockquote>${children}</blockquote>`;
    case "list": {
      const tag = (node.listType as string) === "number" ? "ol" : "ul";
      return `<${tag}>${children}</${tag}>`;
    }
    case "listitem":
      return `<li>${children}</li>`;
    case "link": {
      const linkFields = node.fields as Record<string, unknown> | undefined;
      const linkType = String((linkFields?.linkType as string | undefined) ?? "");
      const linkedDoc = linkFields?.doc as
        | { relationTo?: unknown; value?: unknown }
        | { fullSlug?: unknown; slug?: unknown }
        | number
        | string
        | undefined;
      const docValue =
        linkedDoc && typeof linkedDoc === "object" && "value" in linkedDoc
          ? (linkedDoc as { value?: unknown }).value
          : linkedDoc;
      const rawUrl =
        (linkFields?.url as string | undefined) ??
        (linkType === "internal" && docValue && typeof docValue === "object"
          ? String(
              (docValue as { fullSlug?: unknown }).fullSlug ??
                (docValue as { slug?: unknown }).slug ??
                "",
            )
          : undefined) ??
        (node.url as string | undefined) ??
        "";
      const newTab =
        (linkFields?.newTab as boolean | undefined) ??
        (node.newTab as boolean | undefined) ??
        false;
      const normalizedUrl =
        linkType === "internal" && rawUrl && !rawUrl.startsWith("/")
          ? `/${rawUrl}`
          : rawUrl;
      const url = escapeHtml(String(normalizedUrl));
      const nofollow = Boolean(linkFields?.nofollow);
      const relTokens: string[] = [];

      if (nofollow) {
        relTokens.push("nofollow");
      }

      if (newTab) {
        relTokens.push("noopener", "noreferrer");
      }

      const target = newTab ? ' target="_blank"' : "";
      const rel = relTokens.length > 0 ? ` rel="${relTokens.join(" ")}"` : "";

      return `<a href="${url}"${target}${rel}>${children}</a>`;
    }
    case "upload": {
      const src = escapeHtml(
        String(
          (node.value as Record<string, unknown>)?.url ??
            (node.src as string) ??
            "",
        ),
      );
      const alt = escapeHtml(
        String((node.value as Record<string, unknown>)?.alt ?? ""),
      );
      return src ? `<img src="${src}" alt="${alt}" />` : "";
    }
    case "block": {
      const fields = node.fields as Record<string, unknown> | undefined;
      if (fields?.blockType === "contentImage") {
        const image = fields.image as Record<string, unknown> | undefined;
        if (!image?.url) return "";
        const url = String(image.url);
        const alt = escapeHtml(String(image.alt ?? ""));
        const caption = String(fields.caption ?? "");
        const cloudinaryMatch = url.match(
          /res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/,
        );
        let html = "";
        if (cloudinaryMatch) {
          const [, cloudName, publicId] = cloudinaryMatch;
          const base = `https://res.cloudinary.com/${cloudName}/image/upload`;
          const fullUrl = `${base}/c_fit,w_800/${publicId}`;
          const defaultUrl = `${base}/c_fill,g_center,h_420,w_790/${publicId}`;
          const smallUrl = `${base}/c_fit,w_420/${publicId}`;
          html = `<figure class="image-wrapper"><a href="${fullUrl}" title="${alt}"><img alt="${alt}" src="${defaultUrl}" srcset="${smallUrl} 420w, ${defaultUrl} 747w" sizes="(min-width: 480px) calc(100vw - 60px), calc(100vw - 30px)" /></a>`;
        } else {
          html = `<figure class="image-wrapper"><img src="${escapeHtml(url)}" alt="${alt}" />`;
        }
        if (caption) {
          html += `<figcaption>${escapeHtml(caption)}</figcaption>`;
        }
        html += "</figure>";
        return html;
      }
      if (fields?.blockType === "mapBlock") {
        const iframeUrl = escapeHtml(String(fields.iframeUrl ?? ""));
        const caption = String(fields.caption ?? "");
        let html = `<div class="rich-text-map-container"><div class="rich-text-map-iframe-wrapper"><iframe src="${iframeUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
        if (caption) {
          html += `<p class="rich-text-map-caption">${escapeHtml(caption)}</p>`;
        }
        html += "</div>";
        return html;
      }
      if (fields?.blockType === "seasonalityBlock") {
        const prefixText = String(fields.prefixText ?? "");
        const idealText = String(fields.idealMonthsText ?? "");
        const months = (fields.months as any[]) ?? [];
        const legend = (fields.legend as any[]) ?? [];

        const monthLabels = [
          "Led",
          "Úno",
          "Bře",
          "Dub",
          "Kvě",
          "Čvn",
          "Čvc",
          "Srp",
          "Zář",
          "Říj",
          "Lis",
          "Pro",
        ];

        let html =
          `<div class="rich-text-seasonality-container">${idealText || prefixText ? `<div class="seasonality-ideal-text">${escapeHtml(prefixText)} <strong>${escapeHtml(idealText)}</strong></div>` : ""}<div class="seasonality-grid">` +
          months
            .map(
                (m, i) =>
                `<div class="seasonality-month status-${sanitizeSeasonalityStatus(m.status)}"><div class="month-num">${escapeHtml(String(m.monthNumber ?? i + 1))}</div><div class="month-label">${monthLabels[i]}</div></div>`,
            )
            .join("") +
          `</div><div class="seasonality-legend">${legend
            .map((l: any) => {
              const parts = String(l.label ?? "").split("(");
              const name = parts[0].trim();
              const rawTime = parts.length > 1 ? parts[1].replace(/\)$/, "") : "";
              const time =
                parts.length > 1
                  ? ` <span class="legend-time">(${escapeHtml(rawTime)})</span>`
                  : "";
              return `<div class="legend-item status-${sanitizeSeasonalityStatus(l.status)}"><span class="legend-dot"></span><span class="legend-label"><strong>${escapeHtml(name)}</strong>${time}</span></div>`;
            })
            .join("")}</div></div>`;
        return html;
      }
      if (fields?.blockType === "niceToKnowBlock") {
        const items = (fields.items as any[]) ?? [];
        let html = `<div class="nice-to-know"><div class="nice-to-know__wrap">`;
        items.forEach((item: any) => {
          const t = sanitizeNiceToKnowType(item.type);
          let headerHtml = "";
          if (t === "language") {
            headerHtml = `<div class="nice-to-know-item__content__header"><div class="language-bubble">${escapeHtml(item.headerText || "")}${item.headerSubtext ? `<br/><span>${escapeHtml(item.headerSubtext)}</span>` : ""}</div></div>`;
          } else if (t === "electricity") {
            headerHtml = `<div class="nice-to-know-item__content__header"><img src="/assets/outlets/typeC.png" width="60" height="60" alt="Zásuvka" /></div>`;
          } else if (t === "currency") {
            const renderedCurrency = escapeHtml(context.currencyCode || "--");
            const renderedRate =
              typeof context.exchangeRate === "number"
                ? `${context.exchangeRate.toLocaleString("cs-CZ", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} CZK`
                : "-- CZK";
            headerHtml = `<div class="nice-to-know-item__content__header nice-to-know-item__content__header--currency nice-to-know-item__currency-card">
              <div class="nice-to-know-item__content__header--foreign">
                1 <span class="currency-card-code-value">${renderedCurrency}</span>
                <span class="circleArrow"></span>
              </div>
              <span class="currency-card-rate">${escapeHtml(renderedRate)}</span>
            </div>`;
          } else if (t === "weather") {
            headerHtml = `<div class="nice-to-know-item__content__header"><img src="/assets/information/weather-gray.svg" width="60" height="60" alt="Počasí" /></div>`;
          } else if (t === "time") {
            const tz = item.timezone || "Europe/Prague";
            const timeData = getTimeDataForTimezone(String(tz));
            headerHtml = `<div class="nice-to-know-item__content__header nice-to-know__item--time-header" data-timezone="${escapeHtml(tz)}">
              <span class="nice-to-know-item__day">${escapeHtml(timeData.day)}</span>
              <span class="nice-to-know-item__time">${escapeHtml(timeData.time)}</span>
            </div>`;
          }
          const timeData = t === "time" ? getTimeDataForTimezone(String(item.timezone || "Europe/Prague")) : null;
          html += `<div class="nice-to-know-item nice-to-know__item--${t}"><div class="nice-to-know-item__content">${headerHtml}<div class="nice-to-know-item__body"><span class="nice-to-know-item__title">${escapeHtml(item.title || "")}</span><span class="nice-to-know-item__value-wrap"><span>${escapeHtml(item.value || "")}</span>${t === "time" && timeData ? ` <span class="nice-to-know-item__time-diff">${escapeHtml(timeData.offsetLabel)}</span>` : ""}</span></div></div></div>`;
        });
        html += `</div></div>`;
        return html;
      }
      if (fields?.blockType === "dailyCostsBlock") {
        const heading = escapeHtml(String(fields.heading ?? "Denni naklady"));
        const columns = Array.isArray(fields.columns) ? fields.columns : [];

        let html = `<section class="pi-budget"><h3 class="pi-budget__heading">${heading}</h3>`;

        columns.forEach((column: any) => {
          const tier = sanitizeBudgetTier(column.tier);
          const rangeLabel = escapeHtml(String(column.rangeLabel ?? ""));
          const price = escapeHtml(String(column.price ?? ""));
          const items = Array.isArray(column.items) ? column.items : [];

          html += `<div class="pi-budget-container"><div class="pi-budget-container__title pi-budget-container__title--${tier}"><div class="pi-budget-container__range"><h5>${rangeLabel}</h5></div><div class="pi-budget-container__price">${price}</div></div><ul class="pi-budget-container__list">${items
            .map((item: any) => `<li class="pi-budget-container__list__item">${escapeHtml(String(item?.text ?? ""))}</li>`)
            .join("")}</ul></div>`;
        });

        html += `</section>`;
        return html;
      }
      return children;
    }
    default:
      return children;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeSeasonalityStatus(status: unknown): "off" | "mid" | "peak" {
  if (status === "mid" || status === "peak" || status === "off") {
    return status;
  }
  return "off";
}

function sanitizeNiceToKnowType(
  type: unknown,
): "language" | "electricity" | "currency" | "weather" | "time" {
  if (
    type === "language" ||
    type === "electricity" ||
    type === "currency" ||
    type === "weather" ||
    type === "time"
  ) {
    return type;
  }
  return "language";
}

function sanitizeBudgetTier(type: unknown): "budget" | "midrange" | "top" {
  if (type === "budget" || type === "midrange" || type === "top") {
    return type;
  }
  return "budget";
}

function getTimeDataForTimezone(timeZone: string): {
  day: string;
  time: string;
  offsetLabel: string;
} {
  const now = new Date();

  try {
    const day = now
      .toLocaleDateString("cs-CZ", { weekday: "long", timeZone })
      .toUpperCase();
    const time = now.toLocaleTimeString("cs-CZ", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
    });

    const destinationOffset = getOffsetHours(timeZone, now);
    const pragueOffset = getOffsetHours("Europe/Prague", now);
    const diffHours = destinationOffset - pragueOffset;
    const value = Number.isInteger(diffHours)
      ? `${diffHours}`
      : diffHours.toFixed(1);
    const offsetLabel = `${diffHours >= 0 ? "+" : ""}${value}h`;

    return { day, time, offsetLabel };
  } catch {
    return { day: "", time: "--:--", offsetLabel: "0h" };
  }
}

function getOffsetHours(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  }).formatToParts(date);

  const offsetName = parts.find((part) => part.type === "timeZoneName")?.value;
  if (!offsetName) return 0;

  const match = offsetName.match(/^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/);
  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours + minutes / 60);
}

export function richTextToPlainText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  const texts: string[] = [];

  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") {
      return;
    }

    if (
      "text" in node &&
      typeof (node as { text?: unknown }).text === "string"
    ) {
      texts.push((node as { text: string }).text);
    }

    if (
      "children" in node &&
      Array.isArray((node as { children?: unknown[] }).children)
    ) {
      for (const child of (node as { children: unknown[] }).children) {
        visit(child);
      }
    }

    if ("root" in node) {
      visit((node as { root?: unknown }).root);
    }
  };

  visit(value);

  return texts.join(" ").replace(/\s+/g, " ").trim();
}
