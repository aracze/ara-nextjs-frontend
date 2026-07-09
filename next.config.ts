import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Zmenšování obrázků dělá Cloudinary (viz loader), ne Next server —
    // funguje to tak i se standalone outputem bez další zátěže.
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
  },
  output: "standalone",
};

export default nextConfig;
