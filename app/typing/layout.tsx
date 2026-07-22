import type { Metadata } from "next";

const title = "Tập gõ phím — Luyện gõ 10 ngón";
const description =
  "Bé tập gõ bàn phím bằng mười ngón, có cả tiếng Việt (Telex) và tiếng Anh. Luyện gõ chính xác và nhanh dần theo từng bài.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "tập gõ phím 10 ngón",
    "luyện gõ bàn phím cho bé",
    "gõ Telex tiếng Việt",
    "học đánh máy",
  ],
  alternates: { canonical: "/typing" },
  openGraph: { title: `${title} — Kidrumi`, description, url: "/typing" },
};

export default function TypingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
