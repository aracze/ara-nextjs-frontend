export const StaticHeroImage = ({ heroImage }: { heroImage: string }) => {
  return (
    <div
      className="absolute inset-0 bg-cover bg-no-repeat bg-center"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundPosition: "50% 30%",
      }}
    />
  );
};
