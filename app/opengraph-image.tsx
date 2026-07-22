import { ImageResponse } from "next/og";
import { siteName, brandColor } from "@/lib/site";

// Ảnh chia sẻ mạng xã hội (OpenGraph + Twitter) — dùng chung toàn site.
export const alt = "Kidrumi — Không gian học vui của bé";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Nạp font Baloo 2 (hỗ trợ dấu tiếng Việt) từ Google Fonts, có fallback an toàn.
async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&text=${encodeURIComponent(
        text,
      )}`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((https:\/\/[^)]+\.ttf)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const title = "Kidrumi";
  const tagline = "Không gian học vui của bé";
  const chips = ["Nhiệm vụ", "Shadowing", "Học toán", "Tập gõ phím"];

  const fontData = await loadFont(title + tagline + chips.join(""));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${brandColor} 0%, #6355d8 60%, #ef7fb0 130%)`,
          color: "#ffffff",
          fontFamily: fontData ? "Baloo 2" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 80px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: 48,
            border: "4px solid rgba(255,255,255,0.35)",
          }}
        >
          <div style={{ fontSize: 128, lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 46, marginTop: 16, opacity: 0.95 }}>
            {tagline}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 44 }}>
            {chips.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  fontSize: 30,
                  padding: "14px 30px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.9)",
                  color: "#6355d8",
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // Có font Baloo (dấu tiếng Việt) thì dùng; nếu tải hụt, bỏ qua để
      // next/og tự dùng font mặc định (không truyền mảng rỗng — sẽ lỗi).
      ...(fontData
        ? {
            fonts: [
              { name: "Baloo 2", data: fontData, weight: 800, style: "normal" },
            ],
          }
        : {}),
    },
  );
}
