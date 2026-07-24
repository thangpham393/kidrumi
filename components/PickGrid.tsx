import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";

// Ô chọn hoạt động cho các trang "góc học" (Tiếng Anh / Tiếng Trung / Tiếng Việt).
// Ưu tiên ảnh clay (`img`); chưa có thì rớt về emoji trên nền gradient pastel.
// Mục chưa làm xong đặt `soon: true` → hiện huy hiệu "Sắp có", không điều hướng.
export type PickItem = {
  href?: string;
  img?: string; // ảnh clay minh hoạ (16:10) — ưu tiên nếu có
  glyph: string; // emoji dự phòng khi chưa có ảnh
  title: string;
  sub: string;
  desc: string;
  tone: string; // màu nhấn (tiêu đề + CTA)
  grad: [string, string]; // 2 mốc gradient cho nền thumb
  soon?: boolean;
};

function Card({ item }: { item: PickItem }) {
  const { img, glyph, title, sub, desc, tone, grad, soon, href } = item;
  const style = { ["--tone" as string]: tone } as CSSProperties;
  const thumbStyle: CSSProperties = {
    background: `linear-gradient(160deg, ${grad[0]}, ${grad[1]})`,
  };
  const inner = (
    <>
      <span className="pick-tape" aria-hidden />
      {soon && <span className="soon-badge">Sắp có</span>}
      <div className="pick-thumb" style={thumbStyle}>
        {img ? (
          <Image
            src={img}
            alt={title}
            fill
            sizes="(max-width: 720px) 92vw, 460px"
            className="pick-photo"
          />
        ) : (
          <span className="pick-glyph" aria-hidden>
            {glyph}
          </span>
        )}
      </div>
      <div className="pick-body">
        <h3>{title}</h3>
        <div className="pick-sub">{sub}</div>
        <p>{desc}</p>
        <span className="pick-cta">{soon ? "Sắp mở nhé →" : "Vào chơi →"}</span>
      </div>
    </>
  );

  if (soon || !href) {
    return (
      <div className="pick-card soon" style={style} aria-disabled>
        {inner}
      </div>
    );
  }
  return (
    <Link href={href} className="pick-card" style={style}>
      {inner}
    </Link>
  );
}

export default function PickGrid({ items }: { items: PickItem[] }) {
  return (
    <section className={`pick-grid ${items.length === 1 ? "one" : ""}`}>
      {items.map((it) => (
        <Card key={it.title} item={it} />
      ))}
    </section>
  );
}
