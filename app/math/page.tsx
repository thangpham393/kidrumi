import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";

// Vườn Toán — trang chọn trò, nhóm theo độ tuổi. Ưu tiên ảnh clay (`img`), chưa có
// thì rớt về emoji trên nền gradient pastel. Trò chưa làm xong đặt `soon: true` →
// hiện huy hiệu "Sắp có", không điều hướng. Trò đã có (Phiếu bài tập) thì link thật.
type Game = {
  title: string;
  img?: string;
  glyph: string;
  tone: string;
  grad: [string, string];
  href?: string;
  soon?: boolean;
};
type Group = { age: string; icon: string; games: Game[] };

const groups: Group[] = [
  {
    age: "3 tuổi",
    icon: "🌱",
    games: [
      { title: "Phân loại vào rổ", img: "/illustrations/math-sort-basket.png", glyph: "🧺", tone: "var(--green)", grad: ["var(--green-soft)", "#d3efdd"], soon: true },
      { title: "Cái nào hơn?", img: "/illustrations/math-compare.png", glyph: "🐘", tone: "var(--amber)", grad: ["var(--amber-soft)", "#ffe6bf"], soon: true },
      { title: "Tiếp nối dãy", img: "/illustrations/math-pattern.png", glyph: "🍎", tone: "var(--pink)", grad: ["var(--pink-soft)", "#fbd6e8"], soon: true },
      { title: "Hình gì đây?", img: "/illustrations/math-shapes.png", glyph: "🔷", tone: "var(--blue)", grad: ["var(--blue-soft)", "#cfe7fb"], soon: true },
      { title: "Tìm hình trốn", img: "/illustrations/math-find.png", glyph: "🔍", tone: "var(--green)", grad: ["var(--green-soft)", "#d3efdd"], soon: true },
    ],
  },
  {
    age: "4–5 tuổi",
    icon: "🌿",
    games: [
      { title: "Đếm cùng bé", img: "/illustrations/math-count.png", glyph: "🐤", tone: "var(--amber)", grad: ["var(--amber-soft)", "#ffe6bf"], soon: true },
      { title: "Xếp theo thứ tự", img: "/illustrations/math-order.png", glyph: "📊", tone: "var(--green)", grad: ["var(--green-soft)", "#d3efdd"], soon: true },
      { title: "Phân loại hình", img: "/illustrations/math-sort-shape.png", glyph: "🔺", tone: "var(--green)", grad: ["var(--green-soft)", "#d3efdd"], soon: true },
    ],
  },
  {
    age: "6–7 tuổi",
    icon: "✏️",
    games: [
      { title: "Phiếu bài tập", img: "/illustrations/math-worksheet.png", glyph: "📝", tone: "var(--brand)", grad: ["var(--brand-soft)", "#e0dcff"], href: "/math/worksheet" },
    ],
  },
];

const allGames = groups.flatMap((g) => g.games);
const readyCount = allGames.filter((g) => !g.soon && g.href).length;
const soonCount = allGames.length - readyCount;

function Tile({ g }: { g: Game }) {
  const style = { ["--tone" as string]: g.tone } as CSSProperties;
  const thumbStyle: CSSProperties = {
    background: `linear-gradient(160deg, ${g.grad[0]}, ${g.grad[1]})`,
  };
  const inner = (
    <>
      {g.soon && <span className="soon-badge">Sắp có</span>}
      <div className="game-thumb" style={thumbStyle}>
        {g.img ? (
          <Image
            src={g.img}
            alt={g.title}
            fill
            sizes="(max-width: 720px) 45vw, (max-width: 900px) 30vw, 250px"
            className="game-photo"
          />
        ) : (
          <span className="game-glyph" aria-hidden>
            {g.glyph}
          </span>
        )}
      </div>
      <div className="game-title">{g.title}</div>
    </>
  );
  if (g.soon || !g.href) {
    return (
      <div className="game-tile soon" style={style} aria-disabled>
        {inner}
      </div>
    );
  }
  return (
    <Link href={g.href} className="game-tile" style={style}>
      {inner}
    </Link>
  );
}

export default function MathPage() {
  return (
    <main className="wrap">
      <p className="page-eyebrow">VƯỜN TOÁN</p>
      <h1 className="page-title">Hôm nay mình chơi trò gì nào?</h1>
      <p className="page-sub">Chọn một trò theo độ tuổi của bé nhé!</p>

      <div className="math-groups">
        {groups.map((grp) => (
          <div key={grp.age}>
            <div className="age-row">
              <span className="age-label">
                <span aria-hidden>{grp.icon}</span> {grp.age}
              </span>
            </div>
            <div className="game-grid">
              {grp.games.map((g) => (
                <Tile key={g.title} g={g} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="math-foot">
        {readyCount} trò đã sẵn sàng để chơi
      </p>
      <div className="soon-bar">
        <span>Sắp có thêm {soonCount} trò</span>
        <span className="plus" aria-hidden>
          +
        </span>
      </div>
    </main>
  );
}
