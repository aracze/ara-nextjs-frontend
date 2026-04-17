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
