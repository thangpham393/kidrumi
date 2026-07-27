"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useChild } from "@/components/ChildContext";
import Emoji from "@/components/Emoji";
import type { Roadmap } from "./roadmap";
import { useListenProgress } from "./progress";

type Props = {
  lang: string; // "en" | "zh"
  roadmap: Roadmap;
  basePath: string; // vd "/english/listen"
  backHref: string; // vd "/english"
  backLabel: string; // vd "Tiếng Anh"
  eyebrow: string; // vd "GÓC TIẾNG ANH"
  title: string; // vd "Lộ trình Nghe & chọn"
};

export default function ListenRoadmap({
  lang,
  roadmap,
  basePath,
  backHref,
  backLabel,
  eyebrow,
  title,
}: Props) {
  const { child } = useChild();
  const childId = child?.id ?? null;
  const { done, ready } = useListenProgress(lang, childId);

  const flat = roadmap.lessons;

  // Mở khoá tuyến tính: chặng đầu luôn mở; chặng sau mở khi chặng trước đã xong.
  const { unlocked, current } = useMemo(() => {
    const un = new Set<string>();
    let cur: string | null = null;
    flat.forEach((l, i) => {
      const open = i === 0 || done.has(flat[i - 1].id);
      if (open) un.add(l.id);
      if (open && !done.has(l.id) && cur === null) cur = l.id;
    });
    return { unlocked: un, current: cur };
  }, [flat, done]);

  const doneCount = flat.filter((l) => done.has(l.id)).length;
  const total = flat.length;
  const curLesson = flat.find((l) => l.id === current);

  return (
    <main className="wrap rm-wrap" data-ready={ready ? "1" : "0"}>
      <div className="rm-head">
        <Link href={backHref} className="pill rm-back">
          ← {backLabel}
        </Link>
        <div className="rm-head-main">
          <p className="page-eyebrow">{eyebrow}</p>
          <h1 className="page-title rm-title">{title}</h1>
          <p className="page-sub">
            Đi theo con đường sao — hoàn thành từng chặng để mở chặng mới nhé!
          </p>
        </div>
        <div className="rm-progress" aria-label={`Đã xong ${doneCount} trên ${total} chặng`}>
          <div className="rm-progress-top">
            <span className="rm-progress-label">Tiến độ</span>
            <span className="rm-progress-num">
              {doneCount}/{total} ⭐
            </span>
          </div>
          <div className="rm-progress-track">
            <div
              className="rm-progress-fill"
              style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
            />
          </div>
          <div className="rm-progress-now">
            {curLesson ? (
              <>
                <span aria-hidden>{curLesson.icon}</span> {curLesson.topicLabel} ·{" "}
                {curLesson.stage}
              </>
            ) : (
              <>🎉 Bé đã hoàn thành cả lộ trình!</>
            )}
          </div>
        </div>
      </div>

      {roadmap.bands.map((band) => (
        <section key={band.key} className={`rm-band-wrap rm-${band.kind}`}>
          <div className="rm-band">
            <span className="rm-band-eyebrow">{band.eyebrow}</span>
            <span className="rm-band-label">
              <Emoji emoji={band.icon} className="rm-band-ic" /> {band.label}
            </span>
          </div>

          <ol className="rm-path">
            {band.lessons.map((l) => {
              const isDone = done.has(l.id);
              const isOpen = unlocked.has(l.id);
              const isCurrent = l.id === current;
              const state = isDone ? "done" : isOpen ? (isCurrent ? "current" : "open") : "locked";
              const disc = (
                <span className="rm-node-disc" aria-hidden>
                  {isDone ? (
                    <span className="rm-node-check">✓</span>
                  ) : isOpen ? (
                    <Emoji emoji={l.icon} className="rm-node-emoji" />
                  ) : (
                    <span className="rm-node-lock">🔒</span>
                  )}
                </span>
              );
              const caption = (
                <span className="rm-node-cap">
                  <span className="rm-node-name">
                    {l.topicLabel} · {l.stage}
                  </span>
                  <span className="rm-node-status">
                    {isDone ? "Đã xong ⭐" : isOpen ? (isCurrent ? "Bắt đầu →" : "Chơi lại") : "Chưa mở"}
                  </span>
                </span>
              );

              if (!isOpen) {
                return (
                  <li key={l.id} className={`rm-node ${state}`}>
                    {disc}
                    {caption}
                  </li>
                );
              }
              return (
                <li key={l.id} className={`rm-node ${state}`}>
                  <Link
                    href={`${basePath}/${l.id}`}
                    className="rm-node-link"
                    aria-label={`${l.topicLabel} ${l.stage}${isDone ? " (đã xong)" : ""}`}
                  >
                    {disc}
                    {caption}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </main>
  );
}
