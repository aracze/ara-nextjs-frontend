import { StaticHeroOverlay } from "@/components/features/static-hero-overlay";
import { StaticHeroWave } from "@/components/features/static-hero-wave";

export const HeroSection = ({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string | null;
}) => {
  return (
    <section className="relative w-full h-[350px] overflow-hidden bg-[#3b444f]">
      {/* Cover Image Background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-center transition-transform duration-[10000ms] hover:scale-105"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
          backgroundPosition: "50% 35%",
        }}
      />

      {/* Title Content - Overlaid like in Grails */}
      <div className="relative z-[101] h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-[36px] font-bold text-white text-center drop-shadow-[1px_1_1px_rgba(0,0,0,0.5)] tracking-normal">
          {title}
        </h1>
      </div>

      <StaticHeroOverlay />

      <StaticHeroWave />
    </section>
  );
};
