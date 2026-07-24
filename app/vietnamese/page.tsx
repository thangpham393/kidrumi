import PickGrid, { type PickItem } from "@/components/PickGrid";

const items: PickItem[] = [
  {
    img: "/illustrations/vi-story.png",
    glyph: "🐰",
    title: "Nghe hiểu câu chuyện",
    sub: "Nghe chuyện rồi xếp tranh đúng thứ tự",
    desc: "Bé nghe một câu chuyện ngắn rồi xếp ba bức tranh theo đúng thứ tự trước sau.",
    tone: "#c76b2f",
    grad: ["var(--amber-soft)", "#ffe6c2"],
    soon: true,
  },
];

export default function VietnamesePage() {
  return (
    <main className="wrap">
      <p className="page-eyebrow">GÓC TIẾNG VIỆT</p>
      <h1 className="page-title">Hôm nay mình chơi gì nào?</h1>
      <p className="page-sub">Chọn một trò để bắt đầu nhé!</p>
      <PickGrid items={items} />
    </main>
  );
}
