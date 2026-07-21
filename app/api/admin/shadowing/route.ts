import { NextResponse } from "next/server";
import {
  importFromUrl,
  readGenerated,
  deleteGenerated,
  ImportError,
  type Lang,
} from "@/lib/shadowing-import";

// Cần Node runtime (dùng child_process + fs). Không cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Công cụ soạn nội dung — chỉ cho chạy ở môi trường phát triển (npm run dev),
// tránh bị lộ khi deploy lên production.
function guard(): NextResponse | null {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Trang quản trị chỉ dùng khi chạy `npm run dev` trên máy của bạn." },
      { status: 403 }
    );
  }
  return null;
}

// Rút gọn để hiển thị danh sách (không kèm toàn bộ transcript cho nhẹ).
function summarize() {
  return readGenerated().map((v) => ({
    id: v.id,
    title: v.title,
    lang: v.lang,
    source: v.source,
    level: v.level,
    dur: v.dur,
    emoji: v.emoji,
    youtubeId: v.youtubeId,
    count: v.segments.length,
  }));
}

export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;
  return NextResponse.json({ videos: summarize() });
}

export async function POST(request: Request) {
  const blocked = guard();
  if (blocked) return blocked;

  let body: { url?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body không hợp lệ." }, { status: 400 });
  }

  const url = (body.url || "").trim();
  if (!url) return NextResponse.json({ error: "Thiếu link YouTube." }, { status: 400 });
  const lang =
    body.lang === "en" || body.lang === "zh" ? (body.lang as Lang) : undefined;

  try {
    const { video, updated, total } = await importFromUrl(url, lang);
    return NextResponse.json({
      ok: true,
      updated,
      total,
      video: {
        id: video.id,
        title: video.title,
        lang: video.lang,
        source: video.source,
        level: video.level,
        dur: video.dur,
        emoji: video.emoji,
        youtubeId: video.youtubeId,
        count: video.segments.length,
        preview: video.segments.slice(0, 6),
      },
      videos: summarize(),
    });
  } catch (e) {
    const msg = e instanceof ImportError ? e.message : "Có lỗi khi nạp video.";
    if (!(e instanceof ImportError)) console.error("[import-shadowing]", e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const blocked = guard();
  if (blocked) return blocked;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu id." }, { status: 400 });
  deleteGenerated(id);
  return NextResponse.json({ ok: true, videos: summarize() });
}
