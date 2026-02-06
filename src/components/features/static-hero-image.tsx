interface StaticHeroImageProps {
  imageUrl: string | null;
  styleCss?: string;
}

export const StaticHeroImage = ({
  imageUrl,
  styleCss,
}: StaticHeroImageProps) => {
  return (
    <div
      className="absolute inset-0 bg-cover bg-no-repeat bg-center transition-transform duration-[10000ms] hover:scale-105"
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
        backgroundPosition: styleCss || "50% 35%",
      }}
    />
  );
};
