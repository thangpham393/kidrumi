import type { Metadata } from "next";

const title = "Tiếng Việt cho bé — Nghe hiểu câu chuyện";
const description =
  "Góc Tiếng Việt của Kidrumi: bé nghe một câu chuyện ngắn rồi xếp các bức tranh theo đúng thứ tự trước sau.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "tiếng Việt cho bé",
    "nghe hiểu câu chuyện",
    "luyện nghe tiếng Việt trẻ em",
    "học tiếng Việt mầm non",
  ],
  alternates: { canonical: "/vietnamese" },
  openGraph: { title: `${title} — Kidrumi`, description, url: "/vietnamese" },
};

export default function VietnameseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
