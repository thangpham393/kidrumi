// Cấu hình SEO dùng chung cho toàn site (layout, sitemap, robots, manifest…).
// Đổi domain ở đây (hoặc đặt NEXT_PUBLIC_SITE_URL trong .env) khi lên production.

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kidrumi.com"
).replace(/\/$/, "");

export const siteName = "Kidrumi";

export const siteTitle = "Kidrumi — Không gian học vui của bé";

export const siteDescription =
  "Kidrumi là góc học online vui nhộn cho bé tuổi tiền tiểu học: nhiệm vụ mỗi ngày, " +
  "shadowing luyện nói tiếng Anh, học toán cộng trừ nhân chia và tập gõ phím 10 ngón.";

export const siteKeywords = [
  "học cho bé",
  "học online cho trẻ",
  "tiền tiểu học",
  "học tiếng Anh cho bé",
  "shadowing tiếng Anh",
  "luyện nói tiếng Anh",
  "học toán cho bé",
  "cộng trừ nhân chia",
  "tập gõ phím 10 ngón",
  "nhiệm vụ hằng ngày cho bé",
  "Kidrumi",
];

export const siteLocale = "vi_VN";

// Màu thương hiệu (khớp --brand trong globals.css) — dùng cho theme-color / manifest.
export const brandColor = "#7c6cf0";
export const backgroundColor = "#efecff";

// Các trang được index (dùng cho sitemap). Login không đưa vào.
export const routes: {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/tasks", changeFrequency: "weekly", priority: 0.9 },
  { path: "/shadowing", changeFrequency: "daily", priority: 0.9 },
  { path: "/math", changeFrequency: "weekly", priority: 0.9 },
  { path: "/typing", changeFrequency: "weekly", priority: 0.8 },
];
