"use client";

import { useEffect, useState } from "react";

type VideoRow = {
  id: string;
  title: string;
  lang: "en" | "zh";
  source: string;
  level: "de" | "mid" | "hard";
  dur: string;
  emoji: string;
  youtubeId: string;
  count: number;
};

type Preview = { t: number; text: string; tr: string };
type Result = VideoRow & { preview: Preview[]; updated: boolean };

const levelLabel: Record<string, string> = { de: "Dễ", mid: "Trung bình", hard: "Khó" };

export default function AdminShadowingPage() {
  const [url, setUrl] = useState("");
  const [lang, setLang] = useState<"" | "en" | "zh">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [list, setList] = useState<VideoRow[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/shadowing")
      .then((r) => r.json())
      .then((d) => {
        if (active && d.videos) setList(d.videos);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const submit = async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch("/api/admin/shadowing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, lang: lang || undefined }),
      });
      const d = await r.json();
      if (!r.ok || d.error) {
        setError(d.error || "Có lỗi xảy ra.");
      } else {
        setResult({ ...d.video, updated: d.updated });
        setList(d.videos);
        setUrl("");
      }
    } catch {
      setError("Không gọi được máy chủ. Kiểm tra server có đang chạy không.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Xoá "${title}" khỏi thư viện?`)) return;
    const r = await fetch(`/api/admin/shadowing?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const d = await r.json();
    if (d.videos) setList(d.videos);
    if (result?.id === id) setResult(null);
  };

  return (
    <main className="wrap" style={{ maxWidth: 820 }}>
      <p className="page-eyebrow">Công cụ soạn nội dung</p>
      <h1 className="page-title">Nạp video Shadowing</h1>
      <p className="page-sub">
        Dán link YouTube, hệ thống tự lấy phụ đề rồi nhờ AI dịch &amp; chú thích từ vựng.
      </p>

      <div className="panel" style={{ marginTop: 8 }}>
        <label
          style={{ display: "block", fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}
        >
          Link YouTube
        </label>
        <input
          className="field"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="https://www.youtube.com/watch?v=..."
          inputMode="url"
          autoComplete="off"
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0 4px" }}>
          <span style={{ alignSelf: "center", color: "var(--muted)", fontSize: 14 }}>
            Ngôn ngữ:
          </span>
          {([
            ["", "Tự động"],
            ["en", "🇬🇧 English"],
            ["zh", "🇨🇳 Chinese"],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              className={`chip ${lang === val ? "on" : ""}`}
              onClick={() => setLang(val)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          className="btn btn-block"
          onClick={submit}
          disabled={loading || !url.trim()}
          style={{ marginTop: 16, opacity: loading || !url.trim() ? 0.6 : 1 }}
        >
          {loading ? "Đang nạp… (10–30 giây)" : "Nạp video ✨"}
        </button>
      </div>

      <div className="hintbox" style={{ marginTop: 16 }}>
        <strong>Cần chuẩn bị (một lần):</strong> cài <code>yt-dlp</code> trên máy
        (<code>brew install yt-dlp</code> hoặc <code>pipx install &quot;yt-dlp[default]&quot;</code>)
        và đặt biến môi trường <code>ANTHROPIC_API_KEY</code> (khoá API Claude) trước khi
        chạy <code>npm run dev</code>. Nội dung nạp xong nằm ở{" "}
        <code>app/shadowing/videos.generated.json</code>.
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: "14px 18px",
            borderRadius: "var(--radius)",
            background: "var(--red-soft)",
            border: "2px solid var(--red)",
            color: "var(--ink)",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 18,
            borderRadius: "var(--radius-lg)",
            background: "var(--green-soft)",
            border: "2px solid var(--green)",
          }}
        >
          <div style={{ fontWeight: 800, color: "var(--ink)" }}>
            {result.updated ? "✅ Đã cập nhật" : "🎉 Đã thêm"}: {result.emoji} {result.title}
          </div>
          <div style={{ color: "var(--ink-soft)", fontSize: 14, margin: "6px 0 12px" }}>
            {result.source} · {levelLabel[result.level]} · {result.dur} · {result.count} câu
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {result.preview.map((s, i) => (
              <div key={i} style={{ fontSize: 14, lineHeight: 1.35 }}>
                <span style={{ color: "var(--ink)" }}>{s.text}</span>
                <br />
                <span style={{ color: "var(--muted)" }}>{s.tr}</span>
              </div>
            ))}
          </div>
          <a
            href={`/shadowing/${result.id}`}
            className="btn btn-ghost"
            style={{ marginTop: 14, display: "inline-block" }}
          >
            Mở bài học →
          </a>
        </div>
      )}

      <h2 style={{ marginTop: 32, fontSize: 22, color: "var(--ink)" }}>
        Đã nạp ({list.length})
      </h2>
      {list.length === 0 ? (
        <p style={{ color: "var(--ink-soft)" }}>Chưa có video nào. Dán link phía trên để bắt đầu.</p>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {list.map((v) => (
            <div
              key={v.id}
              className="panel"
              style={{
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 24 }}>{v.emoji}</span>
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  {v.lang === "zh" ? "中文" : "EN"} · {v.source} · {v.count} câu
                </div>
              </div>
              <a href={`/shadowing/${v.id}`} className="btn-ghost" style={{ padding: "8px 14px" }}>
                Mở
              </a>
              <button
                onClick={() => remove(v.id, v.title)}
                className="btn-ghost"
                style={{ padding: "8px 14px", color: "var(--red)", borderColor: "var(--red)" }}
              >
                Xoá
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
