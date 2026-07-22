import type { Metadata } from "next";
import { getVideo, langLabel, levelLabel } from "../data";
import { siteUrl, siteName } from "@/lib/site";

type Params = { params: Promise<{ id: string }> };

function descFor(id: string): { title: string; description: string } | null {
  const v = getVideo(id);
  if (!v) return null;
  const title = `${v.title} — Shadowing ${langLabel[v.lang]}`;
  const description =
    `Luyện shadowing với video "${v.title}" (${langLabel[v.lang]}) trên ${siteName}: ` +
    `bé nghe rồi nói lại theo từng câu để luyện phát âm, có phụ đề và dịch nghĩa tiếng Việt. ` +
    `Nguồn: ${v.source}. Độ khó: ${levelLabel[v.level]}.`;
  return { title, description };
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { id } = await params;
  const v = getVideo(id);
  const meta = descFor(id);
  if (!v || !meta) {
    return { title: "Video shadowing", robots: { index: false, follow: true } };
  }
  const thumb = `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/shadowing/${id}` },
    openGraph: {
      type: "video.other",
      title: `${meta.title} — ${siteName}`,
      description: meta.description,
      url: `/shadowing/${id}`,
      images: [{ url: thumb, width: 480, height: 360, alt: v.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.title} — ${siteName}`,
      description: meta.description,
      images: [thumb],
    },
  };
}

// "M:SS" / "H:MM:SS" → ISO 8601 duration (PT#M#S) cho schema VideoObject.
function isoDuration(dur: string): string | undefined {
  const parts = dur.split(":").map((n) => parseInt(n, 10));
  if (parts.some(Number.isNaN)) return undefined;
  let h = 0,
    m = 0,
    s = 0;
  if (parts.length === 3) [h, m, s] = parts;
  else if (parts.length === 2) [m, s] = parts;
  else return undefined;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}` || "PT0S";
}

export default async function ShadowingDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = getVideo(id);
  const meta = descFor(id);

  const jsonLd =
    v && meta
      ? {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: v.title,
          description: meta.description,
          thumbnailUrl: [
            `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
          ],
          duration: isoDuration(v.dur),
          embedUrl: `https://www.youtube.com/embed/${v.youtubeId}`,
          contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
          inLanguage: v.lang,
          url: `${siteUrl}/shadowing/${id}`,
          publisher: {
            "@type": "Organization",
            name: siteName,
            logo: {
              "@type": "ImageObject",
              url: `${siteUrl}/icon.svg`,
            },
          },
        }
      : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
