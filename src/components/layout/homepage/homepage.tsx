import { StaticHeroWave } from "@/components/features/static-hero-wave";
import { Homepage as HomepageType } from "@/types/strapi";
import { StaticHeroOverlay } from "@/components/features/static-hero-overlay";
import { StaticHeroTitle } from "./static-hero-title";
import { StaticHeroImage } from "@/components/features/static-hero-image";

export const Homepage = ({ homepage }: { homepage?: HomepageType | null }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full h-[350px] overflow-hidden bg-[#3b444f]">
        <StaticHeroImage
          imageUrl={
            "https://res.cloudinary.com/ara/image/upload/c_fit,w_1600,q_auto/homepage.jpg"
          }
        />

        <StaticHeroTitle title={"Najdi si svůj cíl"} />

        <StaticHeroOverlay filterId="blurFilterHome" />

        <StaticHeroWave />
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-12 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 uppercase tracking-wider">
          {homepage?.title}
        </h2>
      </main>
    </div>
  );
};
