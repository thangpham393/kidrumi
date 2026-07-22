import type { Metadata } from "next";

const title = "Shadowing — Luyện nói tiếng Anh";
const description =
  "Bé xem video tiếng Anh rồi nghe và nói lại theo từng câu để luyện phát âm tự nhiên. Kho video chia theo độ khó, có phụ đề và dịch nghĩa.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "shadowing tiếng Anh",
    "luyện nói tiếng Anh cho bé",
    "luyện phát âm tiếng Anh",
    "video học tiếng Anh cho trẻ",
  ],
  alternates: { canonical: "/shadowing" },
  openGraph: { title: `${title} — Kidrumi`, description, url: "/shadowing" },
};

export default function ShadowingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
