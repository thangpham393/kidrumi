"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { confettiBurst, playSuccess } from "@/components/celebrate";
import { useHanziProgress } from "@/components/hanzi/progress";
import { useRecordActivity } from "@/lib/missions";
import StepRecognize from "@/components/hanzi/StepRecognize";
import StepLearn from "@/components/hanzi/StepLearn";
import StepPractice from "@/components/hanzi/StepPractice";
import StepWrite from "@/components/hanzi/StepWrite";
import {
  findUnit,
  STEPS,
  STEP_LABEL,
  type HanziCard,
  type HanziUnit,
  type Step,
} from "../../data";

export default function StudyPage() {
  const params = useParams<{ unit: string; idx: string }>();
  const unit = findUnit(params.unit);
  const i = Number(params.idx);
  const card = unit?.cards[i];

  if (!unit || !card || Number.isNaN(i)) {
    return (
      <main className="wrap lt-wrap">
        <p className="page-sub">Không tìm thấy chữ này.</p>
        <p style={{ textAlign: "center" }}>
          <Link href="/chinese/hanzi" className="btn btn-ghost">← Về lớp học chữ</Link>
        </p>
      </main>
    );
  }

  // key theo chữ → đổi chữ là làm mới bước học (tab về 认, các bước reset).
  return <StudyCard key={`${unit.id}-${i}`} unit={unit} idx={i} card={card} />;
}

function StudyCard({
  unit,
  idx,
  card,
}: {
  unit: HanziUnit;
  idx: number;
  card: HanziCard;
}) {
  const router = useRouter();
  const { child, addStars } = useChild();
  const { showToast, toastEl } = useToast();
  const { ready, isStepDone, stepsDone, markStep } = useHanziProgress(child?.id ?? null);
  const record = useRecordActivity();
  const [tab, setTab] = useState<Step>("认");

  const advance = useCallback((step: Step) => {
    const next = STEPS[STEPS.indexOf(step) + 1];
    if (next) setTimeout(() => setTab(next), 650);
  }, []);

  const handleStepDone = useCallback(
    (step: Step) => {
      const completesChar =
        STEPS.every((s) => s === step || stepsDone(card.char).includes(s));
      const fresh = markStep(card.char, step);

      if (!fresh) {
        advance(step);
        return;
      }
      addStars(1);
      // 认/学 chưa tự ăn mừng → thêm hiệu ứng ở đây (练/写 đã tự confetti).
      if (step === "认" || step === "学") {
        playSuccess();
        confettiBurst();
      }
      if (completesChar) {
        record("hanzi", card.char); // đủ 4 bước 1 chữ → ghi nhận nhiệm vụ
        showToast("Hoàn thành chữ này! Giỏi quá! 🎉");
        setTimeout(() => confettiBurst(), 220);
      } else {
        showToast("Tuyệt vời! ⭐");
        advance(step);
      }
    },
    [advance, addStars, card.char, markStep, showToast, stepsDone, record],
  );

  const go = (to: number) => router.push(`/chinese/hanzi/${unit.id}/${to}`);

  return (
    <main className="wrap lt-wrap lt-zh hz-study">
      <header className="lt-top">
        <Link href={`/chinese/hanzi/${unit.id}`} className="pill" aria-label="Quay lại">
          ← {unit.title}
        </Link>
        <h1 className="lt-title">{card.char}</h1>
        <span aria-hidden />
      </header>

      {/* 4 sao = 4 bước đã xong */}
      <div className="lt-stars" aria-label={`Đã xong ${ready ? stepsDone(card.char).length : 0} trên 4 bước`}>
        {STEPS.map((s) => (
          <span key={s} className={`lt-star ${ready && isStepDone(card.char, s) ? "on" : ""}`}>
            {ready && isStepDone(card.char, s) ? "⭐" : "☆"}
          </span>
        ))}
      </div>

      {/* Thanh tab 认 学 练 写 */}
      <div className="hz-tabs" role="tablist">
        {STEPS.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={s === tab}
            className={`hz-tab ${s === tab ? "on" : ""} ${ready && isStepDone(card.char, s) ? "done" : ""}`}
            onClick={() => setTab(s)}
          >
            <span className="hz-tab-zh">{s}</span>
            <span className="hz-tab-vi">{STEP_LABEL[s]}</span>
          </button>
        ))}
      </div>

      {/* Nội dung bước hiện tại */}
      <section className="hz-stage">
        {tab === "认" && (
          <StepRecognize card={card} done={ready && isStepDone(card.char, "认")} onDone={() => handleStepDone("认")} />
        )}
        {tab === "学" && (
          <StepLearn card={card} done={ready && isStepDone(card.char, "学")} onDone={() => handleStepDone("学")} />
        )}
        {tab === "练" && (
          <StepPractice card={card} done={ready && isStepDone(card.char, "练")} onDone={() => handleStepDone("练")} />
        )}
        {tab === "写" && (
          <StepWrite
            card={card}
            done={ready && isStepDone(card.char, "写")}
            onDone={() => handleStepDone("写")}
            hasNext={idx < unit.cards.length - 1}
            onNext={() => go(idx + 1)}
            onBackToList={() => router.push(`/chinese/hanzi/${unit.id}`)}
          />
        )}
      </section>

      {/* Chuyển chữ */}
      <nav className="hz-nav">
        <button className="hz-arrow" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Chữ trước">
          ‹
        </button>
        <span className="hz-nav-count">{idx + 1} / {unit.cards.length}</span>
        <button
          className="hz-arrow"
          onClick={() => go(idx + 1)}
          disabled={idx === unit.cards.length - 1}
          aria-label="Chữ tiếp theo"
        >
          ›
        </button>
      </nav>

      {toastEl}
    </main>
  );
}
