import { ImageResponse } from "next/og";

// Ảnh chia sẻ mạng xã hội (OpenGraph + Twitter) — dùng chung toàn site.
// Phong cách clay pastel + gấu bông mascot, đồng bộ với DESIGN.md.
export const alt = "KATKID — Không gian học vui của bé";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Token màu (khớp globals.css)
const INK = "#3b3a5a";
const INK_SOFT = "#6f6e90";

// Gấu bông mascot trên huy hiệu clay — bản phóng to của logo, nhúng bằng data-URI
// SVG để resvg dựng lại đủ gradient + bóng đổ mềm.
const BEAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="230" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9b8bff"/><stop offset="0.55" stop-color="#7c6cf0"/><stop offset="1" stop-color="#ef7fb0"/>
    </linearGradient>
    <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff3e2"/><stop offset="1" stop-color="#ffe2c4"/>
    </linearGradient>
    <filter id="s" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#5b4bc4" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect x="2" y="2" width="44" height="44" rx="15" fill="url(#b)" filter="url(#s)"/>
  <path d="M6 16 Q6 6 16 6 L32 6 Q40 6 41 13 Q24 20 6 16 Z" fill="#ffffff" opacity="0.28"/>
  <circle cx="16.5" cy="16" r="6" fill="url(#f)"/><circle cx="31.5" cy="16" r="6" fill="url(#f)"/>
  <circle cx="16.5" cy="16" r="2.6" fill="#f6c8a0"/><circle cx="31.5" cy="16" r="2.6" fill="#f6c8a0"/>
  <circle cx="24" cy="26" r="12" fill="url(#f)"/>
  <ellipse cx="24" cy="30" rx="6.4" ry="5.2" fill="#ffe9cf"/>
  <circle cx="19.4" cy="24.5" r="1.9" fill="#4a3b5c"/><circle cx="28.6" cy="24.5" r="1.9" fill="#4a3b5c"/>
  <circle cx="20" cy="24" r="0.6" fill="#fff"/><circle cx="29.2" cy="24" r="0.6" fill="#fff"/>
  <ellipse cx="24" cy="28.4" rx="2.1" ry="1.6" fill="#c8748f"/>
  <path d="M21.6 31.4 Q24 33.6 26.4 31.4" stroke="#a86" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  <circle cx="15" cy="29" r="2" fill="#ffc7d9" opacity="0.8"/><circle cx="33" cy="29" r="2" fill="#ffc7d9" opacity="0.8"/>
  <path d="M39 9 c0.5 2 1 2.5 3 3 c-2 0.5 -2.5 1 -3 3 c-0.5 -2 -1 -2.5 -3 -3 c2 -0.5 2.5 -1 3 -3 Z" fill="#fff6c9"/>
</svg>`;
const BEAR_URI = `data:image/svg+xml;utf8,${encodeURIComponent(BEAR_SVG)}`;

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
  const title = "KATKID";
  const tagline = "Không gian học vui của bé";
  const pills: { emoji: string; label: string; bg: string; fg: string }[] = [
    { emoji: "🎯", label: "Nhiệm vụ", bg: "#efecff", fg: "#6355d8" },
    { emoji: "🎧", label: "Shadowing", bg: "#fdeaf3", fg: "#d75f96" },
    { emoji: "➕", label: "Học toán", bg: "#e6f6ec", fg: "#3f9e6a" },
    { emoji: "⌨️", label: "Tập gõ phím", bg: "#e4f2fd", fg: "#3f86c9" },
  ];

  const fontData = await loadFont(
    title + tagline + pills.map((p) => p.label).join(""),
  );

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
          position: "relative",
          background:
            "linear-gradient(140deg, #efecff 0%, #f6eefb 45%, #fdeaf3 100%)",
          fontFamily: fontData ? "Baloo 2" : "sans-serif",
        }}
      >
        {/* Đốm sáng clay trang trí — mềm, không chói */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -100,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "rgba(124,108,240,0.16)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            right: -110,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(239,127,176,0.16)",
          }}
        />
        {/* Thẻ nội dung trắng — bo góc lớn, bóng tím mềm (như .panel) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "44px 58px 52px",
            background: "#ffffff",
            borderRadius: 44,
            border: "3px solid #ecebf6",
            boxShadow: "0 26px 64px rgba(91,75,196,0.24)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BEAR_URI} width={168} height={168} alt="" />
          <div
            style={{
              fontSize: 104,
              lineHeight: 1,
              marginTop: 8,
              // Wordmark gradient tím → hồng
              backgroundImage:
                "linear-gradient(100deg, #7c6cf0 0%, #9b7bf0 40%, #ef7fb0 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 39, marginTop: 6, color: INK }}>
            {tagline}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 34 }}>
            {pills.map((p) => (
              <div
                key={p.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 27,
                  padding: "12px 22px",
                  borderRadius: 999,
                  background: p.bg,
                  color: p.fg,
                }}
              >
                <span style={{ display: "flex", fontSize: 30 }}>{p.emoji}</span>
                {p.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 28, fontSize: 30, color: INK_SOFT }}>
          katkid.com
        </div>
      </div>
    ),
    {
      ...size,
      emoji: "fluent",
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
