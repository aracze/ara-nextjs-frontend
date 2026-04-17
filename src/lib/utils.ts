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

/**
 * Convert a Lexical rich text JSON tree to an HTML string.
 * Falls back to returning the value as-is if it's already a string.
 */
export function richTextToHtml(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';

  const node = value as Record<string, unknown>;
  if ('root' in node) return richTextToHtml(node.root);

  const children = Array.isArray(node.children)
    ? (node.children as Record<string, unknown>[]).map(richTextToHtml).join('')
    : '';

  const type = node.type as string | undefined;

  // Text leaf node
  if (type === 'text' || ('text' in node && typeof node.text === 'string')) {
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
  if (type === 'linebreak') return '<br/>';

  // Block nodes
  switch (type) {
    case 'paragraph':
      return `<p>${children}</p>`;
    case 'heading': {
      const tag = (node.tag as string) || 'h2';
      return `<${tag}>${children}</${tag}>`;
    }
    case 'quote':
      return `<blockquote>${children}</blockquote>`;
    case 'list': {
      const tag = (node.listType as string) === 'number' ? 'ol' : 'ul';
      return `<${tag}>${children}</${tag}>`;
    }
    case 'listitem':
      return `<li>${children}</li>`;
    case 'link': {
      const url = escapeHtml(String((node.url as string) ?? ''));
      const target = node.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${url}"${target}>${children}</a>`;
    }
    case 'upload': {
      const src = escapeHtml(
        String(
          (node.value as Record<string, unknown>)?.url ??
          (node.src as string) ??
          '',
        ),
      );
      const alt = escapeHtml(String((node.value as Record<string, unknown>)?.alt ?? ''));
      return src ? `<img src="${src}" alt="${alt}" />` : '';
    }
    case 'block': {
      const fields = node.fields as Record<string, unknown> | undefined;
      if (fields?.blockType === 'contentImage') {
        const image = fields.image as Record<string, unknown> | undefined;
        if (!image?.url) return '';
        const url = String(image.url);
        const alt = escapeHtml(String(image.alt ?? ''));
        const caption = String(fields.caption ?? '');
        const cloudinaryMatch = url.match(
          /res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/,
        );
        let html = '';
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
        html += '</figure>';
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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

    if ("text" in node && typeof (node as { text?: unknown }).text === "string") {
      texts.push((node as { text: string }).text);
    }

    if ("children" in node && Array.isArray((node as { children?: unknown[] }).children)) {
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
