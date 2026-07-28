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
        "/chinese/hanzi/u3",
        "/chinese/hanzi/u4",
        "/chinese/hanzi/u5",
        "/chinese/hanzi/u6",
        "/chinese/hanzi/u7",
        "/chinese/hanzi/u8",
        "/chinese/hanzi/u9",
        "/chinese/hanzi/u10",
        "/chinese/hanzi/u11",
        "/chinese/hanzi/u12",
        "/chinese/hanzi/u13",
        "/chinese/hanzi/u14",
        "/chinese/hanzi/u15",
        "/chinese/hanzi/u16",
        "/chinese/hanzi/u17",
        "/chinese/hanzi/u18",
        "/chinese/hanzi/u19",
        "/chinese/hanzi/u20",
        "/chinese/hanzi/u21",
        "/chinese/hanzi/u22",
        "/chinese/hanzi/u23",
        "/chinese/hanzi/u24",
        "/chinese/hanzi/u25",
        "/chinese/hanzi/u26",
        "/chinese/hanzi/u27",
        "/chinese/hanzi/u28",
        "/chinese/hanzi/u29",
      ]}
    >
      {children}
    </PlayGate>
  );
}
