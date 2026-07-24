import type { Metadata } from "next";

const title = "Tiếng Trung cho bé — Shadowing & Nghe chọn";
const description =
  "Góc Tiếng Trung của Kidrumi: bé luyện nói theo video với Shadowing và chơi Nghe & chọn — nghe từ tiếng Trung rồi chạm vào đúng hình.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "tiếng Trung cho bé",
    "shadowing tiếng Trung",
    "luyện nghe nói tiếng Trung trẻ em",
    "học tiếng Trung mầm non",
  ],
  alternates: { canonical: "/chinese" },
  openGraph: { title: `${title} — Kidrumi`, description, url: "/chinese" },
};

export default function ChineseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
