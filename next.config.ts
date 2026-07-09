import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Zmenšování obrázků dělá Cloudinary (viz loader), ne Next server —
    // funguje to tak i se standalone outputem bez další zátěže.
    // Loader transformuje jen Cloudinary URL; ne-Cloudinary zdroje (Payload
    // uploads, lokální /assets) se nedají zmenšovat, proto u nich komponenty
    // nastavují `unoptimized` (viz `isCloudinary`), ať `next/image` negeneruje
    // zbytečné srcset kandidáty se stejnou URL.
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
  },
  output: "standalone",
};

export default nextConfig;
