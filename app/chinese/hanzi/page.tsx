"use client";

import Link from "next/link";
import Emoji from "@/components/Emoji";
import { UNITS } from "./data";
import { useHanziProgress } from "@/components/hanzi/progress";
import { useChild } from "@/components/ChildContext";

export default function HanziHome() {
  const { child } = useChild();
  const { ready, charDone, starsOf } = useHanziProgress(child?.id ?? null);

  return (
    <main className="wrap">
      <p className="page-eyebrow">GÓC TIẾNG TRUNG</p>
      <h1 className="page-title">Bé học chữ Hán</h1>
      <p className="page-sub">Mỗi chữ học qua 4 bước: nhận · học · luyện · viết ✍️</p>

      <section className="hz-units-grid">
        {UNITS.map((u) => {
          const unitStars = u.cards.reduce((s, c) => s + starsOf(c.char), 0);
          const maxStars = u.cards.length * 4;
          const doneAll = ready && u.cards.every((c) => charDone(c.char));
          return (
            <Link key={u.id} href={`/chinese/hanzi/${u.id}`} className="hz-unit-card">
              <div className="hz-unit-thumb">
                <Emoji emoji={u.emoji} className="hz-unit-emoji" alt="" />
                {doneAll && <span className="hz-unit-tick" aria-hidden>✓</span>}
              </div>
              <div className="hz-unit-body">
                <h3>{u.title}</h3>
                <div className="hz-unit-chars lt-zh-font">{u.preview}</div>
                <div className="hz-unit-stars" aria-label={`${unitStars} trên ${maxStars} sao`}>
                  <span className="hz-unit-star" aria-hidden>⭐</span>
                  {ready ? `${unitStars}/${maxStars}` : `0/${maxStars}`}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
