import PickGrid, { type PickItem } from "@/components/PickGrid";

const items: PickItem[] = [
  {
    href: "/shadowing?lang=zh",
    img: "/illustrations/zh-shadowing.png",
    glyph: "🎧",
    title: "Shadowing",
    sub: "Xem video, nói theo từng câu",
    desc: "Bé xem video tiếng Trung rồi nghe và nói lại theo từng câu để luyện phát âm.",
    tone: "var(--red)",
    grad: ["var(--red-soft)", "#ffd9cf"],
  },
  {
    href: "/chinese/listen",
    img: "/illustrations/zh-listen.png",
    glyph: "🔊",
    title: "Nghe & chọn",
    sub: "Nghe từ tiếng Trung, chạm đúng hình",
    desc: "Bé nghe một từ hoặc câu lệnh tiếng Trung ngắn rồi chạm vào đúng hình — không cần biết đọc.",
    tone: "var(--brand)",
    grad: ["var(--brand-soft)", "#e0dcff"],
  },
];

export default function ChinesePage() {
  return (
    <main className="wrap">
      <p className="page-eyebrow">GÓC TIẾNG TRUNG</p>
      <h1 className="page-title">Hôm nay mình luyện gì nào?</h1>
      <p className="page-sub">Chọn một trò để bắt đầu nhé!</p>
      <PickGrid items={items} />
    </main>
  );
}
