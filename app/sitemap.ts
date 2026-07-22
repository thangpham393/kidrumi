import type { MetadataRoute } from "next";
import { siteUrl, routes } from "@/lib/site";
import { videos } from "@/app/shadowing/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = routes.map((r) => ({
    url: `${siteUrl}${r.path === "/" ? "" : r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Mỗi video shadowing là một trang chi tiết đáng index.
  const videoPages: MetadataRoute.Sitemap = videos.map((v) => ({
    url: `${siteUrl}/shadowing/${v.id}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
    videos: [
      {
        title: v.title,
        thumbnail_loc: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
        description: `Shadowing: ${v.title} (nguồn ${v.source}).`,
      },
    ],
  }));

  return [...staticPages, ...videoPages];
}
