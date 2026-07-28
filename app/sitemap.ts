import type { MetadataRoute } from "next";
import { siteUrl, routes } from "@/lib/site";
import { videos } from "@/app/shadowing/data";

// Next escape phần <loc>/<lastmod> nhưng KHÔNG escape các trường video (title,
// description) → một tiêu đề chứa "&" (vd "& kể chuyện") làm hỏng XML. Tự escape.
function xml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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
        title: xml(v.title),
        thumbnail_loc: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
        description: xml(`Shadowing: ${v.title} (nguồn ${v.source}).`),
      },
    ],
  }));

  return [...staticPages, ...videoPages];
}
