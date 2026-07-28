"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { findUnit } from "../data";
import { useHanziProgress } from "@/components/hanzi/progress";

export default function UnitGrid() {
  const params = useParams<{ unit: string }>();
  const unit = findUnit(params.unit);
  const { ready, charDone, starsOf } = useHanziProgress();

  if (!unit) {
    return (
      <main className="wrap lt-wrap">
        <p className="page-sub">Không tìm thấy đơn vị này.</p>
        <p style={{ textAlign: "center" }}>
          <Link href="/chinese/hanzi" className="btn btn-ghost">← Về lớp học chữ</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="wrap lt-wrap lt-zh">
      <header className="lt-top">
        <Link href="/chinese/hanzi" className="pill" aria-label="Quay lại">
          ← Quay lại
        </Link>
        <h1 className="lt-title">{unit.title}</h1>
        <span aria-hidden />
      </header>

      <section className="hz-char-grid">
        {unit.cards.map((c, i) => {
          const done = ready && charDone(c.char);
          const stars = starsOf(c.char);
          return (
            <Link
              key={c.char}
              href={`/chinese/hanzi/${unit.id}/${i}`}
              className="hz-gridcard"
              aria-label={`Học chữ ${c.char}`}
            >
              <div className="hz-tian">
                <span className="hz-tian-char">{c.char}</span>
                {done && <span className="hz-gridcard-tick" aria-hidden>✓</span>}
              </div>
              <div className="hz-gridcard-stars" aria-label={`${stars} trên 4 sao`}>
                {[0, 1, 2, 3].map((s) => (
                  <span key={s} className={`hz-mini-star ${ready && s < stars ? "on" : ""}`}>
                    ★
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
