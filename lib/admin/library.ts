import "server-only";
import { readGenerated } from "@/lib/shadowing-import";

// Dữ liệu THẬT: đọc thư viện Shadowing (app/shadowing/videos.generated.json).
// Chỉ chạy phía server (fs). Client lấy qua /api/admin/library.

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
  const raw = readGenerated();
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
