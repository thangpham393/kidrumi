import type { MetadataRoute } from "next";
import {
  siteName,
  siteTitle,
  siteDescription,
  brandColor,
  backgroundColor,
} from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteTitle,
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: backgroundColor,
    theme_color: brandColor,
    lang: "vi",
    categories: ["education", "kids"],
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
