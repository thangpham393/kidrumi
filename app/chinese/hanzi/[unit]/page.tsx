"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { findUnit } from "../data";
import { useHanziProgress } from "@/components/hanzi/progress";
import { useQuizProgress } from "@/components/hanzi/quizProgress";
import { useChild } from "@/components/ChildContext";

export default function UnitGrid() {
  const params = useParams<{ unit: string }>();
  const unit = findUnit(params.unit);
  const { child } = useChild();
  const { ready, charDone, starsOf } = useHanziProgress(child?.id ?? null);
  const { ready: quizReady, recOf } = useQuizProgress(child?.id ?? null);

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

      {(() => {
        const learned = ready ? unit.cards.filter((c) => charDone(c.char)).length : 0;
        const doneAll = ready && learned === unit.cards.length;
        const rec = quizReady ? recOf(unit.id) : undefined;
        return (
          <section className="hz-quiz-banner">
            {doneAll ? (
              <Link href={`/chinese/hanzi/${unit.id}/luyen-tap`} className="hz-quiz-card on">
                <span className="hz-quiz-ic" aria-hidden>🎯</span>
                <span className="hz-quiz-body">
                  <b>Luyện tập tổng hợp</b>
                  <em>Thử thách nhớ mặt chữ của 5 chữ vừa học!</em>
                </span>
                {rec ? (
                  <span className="hz-quiz-best" aria-label={`Điểm cao nhất ${rec.best} trên ${rec.total}`}>
                    🏆 {rec.best}/{rec.total}
                  </span>
                ) : (
                  <span className="hz-quiz-go" aria-hidden>Bắt đầu ›</span>
                )}
              </Link>
            ) : (
              <div className="hz-quiz-card locked" aria-label="Chưa mở khoá luyện tập">
                <span className="hz-quiz-ic" aria-hidden>🔒</span>
                <span className="hz-quiz-body">
                  <b>Luyện tập tổng hợp</b>
                  <em>Học xong cả {unit.cards.length} chữ để mở khoá thử thách nhé!</em>
                </span>
                <span className="hz-quiz-best" aria-hidden>{learned}/{unit.cards.length}</span>
              </div>
            )}
          </section>
        );
      })()}

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
