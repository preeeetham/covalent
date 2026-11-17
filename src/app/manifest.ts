import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Covalent",
    short_name: "Covalent",
    description: "Bonds are shared, not swiped. Three verified people a day, photos that sharpen as you get to know each other.",
    start_url: "/today",
    display: "standalone",
    background_color: "#FBF7F1",
    theme_color: "#FBF7F1",
    orientation: "portrait",
    categories: ["lifestyle", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
