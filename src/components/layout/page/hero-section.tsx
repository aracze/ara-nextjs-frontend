import Link from "next/link";
import { StaticHeroOverlay } from "@/components/features/static-hero-overlay";
import { StaticHeroWave } from "@/components/features/static-hero-wave";
import { StaticHeroImage } from "@/components/features/static-hero-image";

interface Breadcrumb {
  title: string;
  href: string;
}

interface HeroSectionProps {
  title: string;
  imageUrl: string | null;
  styleCss?: string;
  filterId?: string;
  breadcrumbs?: Breadcrumb[];
}

export const HeroSection = ({
  title,
  imageUrl,
  styleCss,
  filterId,
  breadcrumbs,
}: HeroSectionProps) => {
  return (
    <section className="relative w-full h-[350px] bg-[#3b444f]">
      {/* Cover Image Background with its own overflow clipping */}
      <div className="absolute inset-0 overflow-hidden">
        <StaticHeroImage imageUrl={imageUrl} styleCss={styleCss} />
      </div>

      {/* Title Content - Overlaid like in Grails */}
      <div className="relative z-[101] h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb navigation"
            className="mb-4 flex items-center gap-2 -translate-y-[24px] bg-white/90 backdrop-blur-md border border-white/20 rounded-full px-5 py-1.5 shadow-sm"
          >
            {breadcrumbs.map((bc, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Link
                  href={bc.href}
                  className="text-[#3b444f] text-[14px] tracking-wide font-medium transition-colors hover:text-[#287bbb]"
                >
                  {bc.title}
                </Link>
                {idx < breadcrumbs.length - 1 && (
                  <span
                    className="text-gray-300 text-[12px] px-0.5"
                    aria-hidden="true"
                  >
                    /
                  </span>
                )}
              </div>
            ))}
          </nav>
        )}
        <h1 className="relative -translate-y-[24px] text-[36px] font-semibold text-white text-center tracking-normal [text-shadow:1px_1px_1px_rgba(0,0,0,0.5)] after:absolute after:bottom-[-5px] after:left-1/2 after:w-[30px] after:-ml-[15px] after:border-b after:border-[#D7E1EF] after:content-['']">
          {title}
        </h1>
      </div>

      <StaticHeroOverlay filterId={filterId} />

      <StaticHeroWave />
    </section>
  );
};
