import React from "react";
import { cloudinaryVariant } from "@/lib/cloudinary-loader";

/**
 * Obrázek karty místa s ořezem podle zařízení (art direction přes <picture>).
 *
 * Karta má pevnou výšku 280 px, ale proměnlivou šířku, takže její tvar se mění:
 * pod 1024 px (mobil/tablet) je na šířku, na desktopu je vedle mapy na výšku,
 * bez mapy skoro čtvercová. Pro každý případ proto Cloudinary ořízne jiný poměr
 * (`c_fill,g_auto`), aby se nestahovaly pixely, které `object-cover` stejně ořízne.
 *
 * Šířky se nabízejí jako plynulá škála (`w`-descriptory + `sizes`), ne jen kroky
 * 1×/2×. Displeje s neceločíselným zvětšením (125 %, 150 %) tak stáhnou přesně
 * potřebnou velikost místo skoku na dvojnásobek.
 *
 * Ne-Cloudinary zdroje (dev/localhost) se nedají ořezávat → poslouží originál.
 */

const BASE = "f_auto,q_auto";

// Desktop kryje kartu ~207 px (vedle mapy) i ~278 px (bez mapy), včetně retiny.
const DESKTOP_WIDTHS = [180, 220, 280, 340, 420, 520, 620];
// Mobil (100 vw) i tablet (50 vw) po celé šíři obrazovky.
const SMALL_WIDTHS = [320, 420, 520, 640, 768, 900];

function srcSet(src: string, crop: string, widths: number[]): string {
  return widths
    .map((w) => `${cloudinaryVariant(src, `${BASE},${crop},w_${w}`)} ${w}w`)
    .join(", ");
}

interface PlaceCardImageProps {
  src: string;
  alt: string;
  className?: string;
  /** true = karta vedle mapy (3 sloupce, na výšku); false = 4 sloupce, skoro čtverec */
  hasMap?: boolean;
}

export function PlaceCardImage({
  src,
  alt,
  className,
  hasMap = false,
}: PlaceCardImageProps) {
  // Desktop: vedle mapy portrét (~207×280 → 5:7), jinak skoro čtverec (~278×280 → 1:1)
  const desktopAr = hasMap ? "5:7" : "1:1";
  const desktopSizes = hasMap ? "210px" : "280px";

  return (
    <picture>
      {/* Desktop (≥1024 px) */}
      <source
        media="(min-width: 1024px)"
        srcSet={srcSet(src, `c_fill,g_auto,ar_${desktopAr}`, DESKTOP_WIDTHS)}
        sizes={desktopSizes}
      />
      {/* Mobil + tablet (<1024 px): karta je na šířku */}
      <img
        src={cloudinaryVariant(src, `${BASE},c_fill,g_auto,ar_3:2,w_640`)}
        srcSet={srcSet(src, "c_fill,g_auto,ar_3:2", SMALL_WIDTHS)}
        sizes="(min-width: 640px) 50vw, 100vw"
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}
