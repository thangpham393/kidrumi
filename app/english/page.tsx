import PickGrid, { type PickItem } from "@/components/PickGrid";

const items: PickItem[] = [
  {
    href: "/shadowing?lang=en",
    img: "/illustrations/en-shadowing.png",
    glyph: "🎧",
    title: "Shadowing",
    sub: "Xem video, nói theo từng câu",
    desc: "Bé xem video tiếng Anh rồi nghe và nói lại theo từng câu để luyện phát âm.",
    tone: "var(--blue)",
    grad: ["var(--blue-soft)", "#cfe7fb"],
  },
  {
    img: "/illustrations/en-listen.png",
    glyph: "🔊",
    title: "Nghe & chọn",
    sub: "Nghe từ tiếng Anh, chạm đúng hình",
    desc: "Bé nghe một từ hoặc câu lệnh tiếng Anh ngắn rồi chạm vào đúng hình — không cần biết đọc.",
    tone: "var(--brand)",
    grad: ["var(--brand-soft)", "#e0dcff"],
    soon: true,
  },
];

export default function EnglishPage() {
  return (
    <main className="wrap">
      <p className="page-eyebrow">GÓC TIẾNG ANH</p>
      <h1 className="page-title">Hôm nay mình luyện gì nào?</h1>
      <p className="page-sub">Chọn một trò để bắt đầu nhé!</p>
      <PickGrid items={items} />
    </main>
  );
}
