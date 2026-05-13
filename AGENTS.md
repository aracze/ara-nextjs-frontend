# Ara Next.js Frontend Development Rules

You are an expert Next.js and React developer. When working on the Ara frontend, follow these rules:

## Core Principles

1. **TypeScript-First**: Use strict types. Prefer enums (e.g., `PageCategory`) over raw strings.
2. **Security & Sanitization**:
   - **ALWAYS** sanitize HTML strings or SVG code before using `dangerouslySetInnerHTML`.
   - Use `isomorphic-dompurify` to ensure sanitization works consistently on both Server (SSR) and Client (CSR).
   - When sanitizing in `utils.ts` or components, ensure essential tags like `iframe` (for maps) or `svg` (for icons) are added to the allowed list.
3. **Accessibility (a11y)**:
   - Use semantic HTML. Breadcrumbs must use `<nav>`, `<ol>`, and `<li>`.
   - Active pages in navigation must be marked with `aria-current="page"`.
   - Avoid placeholder links (`href="#"`). If a link is not available, render a static element (`<span>` or `<div>`).

## Specific Component Patterns

### 1. Navigation & Breadcrumbs

- Use `fetchAncestorChain` helper in `page.tsx` to resolve the parent hierarchy.
- **Graceful Fallback**: If a parent page is missing in the CMS, do not drop it from the breadcrumbs. Instead, create a placeholder from the URL segment (slug) to preserve the hierarchy.
- Breadcrumbs should show the trail from the root down to the current page.

### 2. Local Time & Timers

- **Wall-clock Alignment**: When using `setInterval` for clocks, always align the start to the next minute boundary using `setTimeout` first. This prevents the clock from drifting relative to the system time.
- **Layout Consistency**: Ensure loading states (placeholders) preserve the same `className` and height as the final rendered content to prevent layout shifts (CLS).
- **Timezone Offsets**: Return `null` for unknown offsets instead of `0` to avoid displaying incorrect data on failure.

### 3. Rich Text Rendering

- `richTextToHtml` in `utils.ts` is the central place for HTML conversion. It must include global sanitization.
- For dynamic titles (e.g., "Praktické informace do..."), use the `genitive` field from Payload for correct Czech declension.
- Ensure "do" prefixes are handled gracefully to avoid duplicates (e.g., `replace(/^do\s+/i, "")`).

## Visual & Design Standards

- **Legacy Parity**: When migrating features from the legacy Grails site, aim for pixel-perfect parity (spacing, vertical lines, watermark icons).
- **Vertical Lines**: Shortened vertical separator lines should use absolute positioning (e.g., `top-[20%] h-[70%]`) rather than full-height borders.

## Code Validation

- Run `pnpm exec prettier --write <path_to_file>` after every edit.
- Validate types with `tsc --noEmit` if unsure about changes.
