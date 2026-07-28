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
  // /chinese và các lộ trình (listen, hanzi) xem tự do; vào chơi/học chi tiết cần đăng nhập.
  return (
    <PlayGate
      openPaths={[
        "/chinese",
        "/chinese/listen",
        "/chinese/hanzi",
        "/chinese/hanzi/u1",
        "/chinese/hanzi/u2",
        "/chinese/hanzi/u1/2",
        "/chinese/hanzi/u1/3",
      ]}
    >
      {children}
    </PlayGate>
  );
}
