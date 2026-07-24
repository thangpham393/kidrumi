import "server-only";
import generatedVideos from "@/app/shadowing/videos.generated.json";

// Dữ liệu THẬT: thư viện Shadowing (app/shadowing/videos.generated.json).
// Dùng IMPORT TĨNH (giống app/shadowing/data.ts) để bundle được lên production —
// KHÔNG dùng fs vì Vercel serverless không chắc đọc được file. Client lấy qua /api/admin/library.

type RawVideo = {
  id: string;
  lang: "en" | "zh";
  title: string;
  source: string;
  level: string;
  dur: string;
  emoji: string;
  youtubeId: string;
  segments?: unknown[];
};

export type SlimVideo = {
  id: string;
  title: string;
  lang: "en" | "zh";
  source: string;
  level: string;
  dur: string;
  emoji: string;
  youtubeId: string;
  count: number; // số câu (segments)
};

export type Count = { key: string; count: number };

export type LibraryStats = {
  total: number;
  totalSegments: number;
  byLang: Count[];
  bySource: Count[];
  byLevel: Count[];
};

export type Library = { videos: SlimVideo[]; stats: LibraryStats };

function tally(items: string[]): Count[] {
  const m = new Map<string, number>();
  for (const k of items) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}

export function getLibrary(): Library {
  const raw = generatedVideos as unknown as RawVideo[];
  const videos: SlimVideo[] = raw.map((v) => ({
    id: v.id,
    title: v.title,
    lang: v.lang,
    source: v.source,
    level: v.level,
    dur: v.dur,
    emoji: v.emoji,
    youtubeId: v.youtubeId,
    count: v.segments?.length ?? 0,
  }));

  const stats: LibraryStats = {
    total: videos.length,
    totalSegments: videos.reduce((s, v) => s + v.count, 0),
    byLang: tally(videos.map((v) => v.lang)),
    bySource: tally(videos.map((v) => v.source)),
    byLevel: tally(videos.map((v) => v.level)),
  };

  return { videos, stats };
}
