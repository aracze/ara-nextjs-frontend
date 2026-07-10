"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps, useCallback, useRef } from "react";

type LinkProps = ComponentProps<typeof Link>;

/**
 * Odkaz s přednačtením při najetí myší / dotyku.
 *
 * Automatický prefetch je vypnutý (menu má desítky odkazů — stahovat všechny
 * dopředu způsobovalo bouři requestů). Místo toho se cílová stránka stáhne ve
 * chvíli, kdy na odkaz uživatel najede myší (na mobilu při začátku dotyku) —
 * než doklikne, obsah už je stažený a navigace působí okamžitě.
 */
export function HoverPrefetchLink({
  href,
  onMouseEnter,
  onTouchStart,
  ...rest
}: LinkProps) {
  const router = useRouter();
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    router.prefetch(typeof href === "string" ? href : String(href));
  }, [router, href]);

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(e) => {
        prefetch();
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        prefetch();
        onTouchStart?.(e);
      }}
      {...rest}
    />
  );
}
