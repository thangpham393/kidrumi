import type { Metadata } from "next";
import PlayGate from "@/components/LoginGate";

const title = "Tiếng Trung cho bé — Shadowing & Nghe chọn";
const description =
  "Góc Tiếng Trung của KATKID: bé luyện nói theo video với Shadowing và chơi Nghe & chọn — nghe từ tiếng Trung rồi chạm vào đúng hình.";

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
  openGraph: { title: `${title} — KATKID`, description, url: "/chinese" },
};

export default function ChineseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /chinese và lộ trình /chinese/listen xem tự do; vào từng bài cần đăng nhập.
  return (
    <PlayGate openPaths={["/chinese", "/chinese/listen"]}>{children}</PlayGate>
  );
}
