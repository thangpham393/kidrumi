"use client";

import { useEffect, useRef, useState } from "react";
import { speak, stopSpeaking } from "@/components/speak";
import type { HanziCard } from "@/app/chinese/hanzi/data";

// Bước 写 — tập viết theo nét bằng Hanzi Writer (dữ liệu nét cục bộ).
// Mỗi chữ viết 2 lượt. Nét đang chờ được TÔ ĐẦY hồng (đúng hình nét, khớp khít chữ
// mẫu) kèm bàn tay 3D chỉ ngón trỏ chạy dọc nét để chỉ hướng viết.
// Overlay (nét hồng + tay) đặt trong một SVG RIÊNG phủ tuyệt đối lên trên → Hanzi
// Writer render/append thế nào cũng không đè được, và dùng đúng transform nên khớp khít.

const SIZE = 300;
const PAD = 14;
const SC = (SIZE - 2 * PAD) / 1024;
const OY = SIZE - PAD - 124 * SC; // gốc y của toạ độ nét (makemeahanzi lệch đáy 124)
const CHAR_TF = `translate(${PAD}, ${OY}) scale(${SC}, ${-SC})`;
const mapPt = (x: number, y: number): [number, number] => [PAD + x * SC, OY - y * SC];
const PASSES = 2;
const NS = "http://www.w3.org/2000/svg";
const GUIDE_COLOR = "#ee5aa0";

export default function StepWrite({
  card,
  done,
  onDone,
  hasNext = false,
  onNext,
  onBackToList,
}: {
  card: HanziCard;
  done: boolean;
  onDone: () => void;
  hasNext?: boolean;
  onNext?: () => void;
  onBackToList?: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  const apiRef = useRef<{ restart: () => void; demo: () => void }>({
    restart: () => {},
    demo: () => {},
  });
  const [pass, setPass] = useState(1);
  const [finished, setFinished] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    let cancelled = false;
    const box = boxRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let writer: any = null;
    let overlay: SVGSVGElement | null = null; // SVG riêng phủ lên trên
    let hand: SVGImageElement | null = null;
    let fillPath: SVGPathElement | null = null;
    let strokes: string[] = [];
    let medians: number[][][] = [];
    let raf = 0;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const passRef = { n: 1 };

    const clearHint = () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      timers = [];
    };
    const HW = 46;
    const placeHand = (sxp: number, syp: number) => {
      if (!hand) return;
      hand.setAttribute("x", String(sxp - HW * 0.4));
      hand.setAttribute("y", String(syp - HW * 0.06));
    };
    const hideHints = () => {
      if (hand) hand.style.display = "none";
      if (fillPath) fillPath.style.opacity = "0";
    };

    // Gợi ý nét thứ i: tô đầy hình nét (hồng) + bàn tay chạy dọc median chỉ hướng.
    const hint = (i: number) => {
      clearHint();
      if (cancelled || !hand || !fillPath) return;
      const med = medians[i];
      const shape = strokes[i];
      if (!med || med.length < 2 || !shape) {
        hideHints();
        return;
      }
      fillPath.setAttribute("d", shape);
      fillPath.style.opacity = "1";
      hand.style.display = "";

      const seg: number[] = [];
      let total = 0;
      for (let k = 1; k < med.length; k++) {
        total += Math.hypot(med[k][0] - med[k - 1][0], med[k][1] - med[k - 1][1]);
        seg.push(total);
      }
      const at = (frac: number): [number, number] => {
        const dist = frac * total;
        for (let k = 0; k < seg.length; k++) {
          if (dist <= seg[k]) {
            const prev = k === 0 ? 0 : seg[k - 1];
            const t = seg[k] - prev ? (dist - prev) / (seg[k] - prev) : 0;
            return [
              med[k][0] + (med[k + 1][0] - med[k][0]) * t,
              med[k][1] + (med[k + 1][1] - med[k][1]) * t,
            ];
          }
        }
        return med[med.length - 1] as [number, number];
      };
      const DUR = Math.max(1200, total * 1.6);
      const runOnce = () => {
        if (cancelled) return;
        placeHand(...mapPt(...at(0)));
        let start: number | null = null;
        const frame = (t: number) => {
          if (cancelled) return;
          if (start == null) start = t;
          const p = Math.min(1, (t - start) / DUR);
          placeHand(...mapPt(...at(p)));
          if (p >= 1) {
            timers.push(setTimeout(runOnce, 500));
            return;
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      };
      runOnce();
    };

    // Đọc lời nhắc bằng giọng Việt: lượt đầu hướng dẫn, các lượt sau bảo bé viết lại.
    const sayGuide = () => {
      speak(
        passRef.n === 1
          ? "Bé hãy viết theo hướng dẫn nhé"
          : "Bé viết lại một lần nữa nhé",
        "vi",
      );
    };

    const startQuiz = () => {
      setFinished(false);
      setShowModal(false);
      sayGuide();
      let cur = 0;
      hint(0);
      writer.quiz({
        onCorrectStroke: () => {
          cur += 1;
          hint(cur);
        },
        onComplete: () => {
          clearHint();
          hideHints();
          if (passRef.n < PASSES) {
            passRef.n += 1;
            setPass(passRef.n);
            timers.push(
              setTimeout(() => {
                if (!cancelled) startQuiz();
              }, 550),
            );
          } else {
            setFinished(true);
            setShowModal(true);
            speak("Bé viết đẹp lắm", "vi");
            onDoneRef.current();
          }
        },
      });
    };

    const demo = () => {
      clearHint();
      hideHints();
      writer.animateCharacter({
        onComplete: () => {
          if (!cancelled) startQuiz();
        },
      });
    };
    const restart = () => {
      clearHint();
      passRef.n = 1;
      setPass(1);
      startQuiz();
    };

    (async () => {
      const HanziWriter = (await import("hanzi-writer")).default;
      const data = await fetch(`/hanzi-data/${card.char}.json`).then((r) => r.json());
      if (cancelled || !box) return;
      medians = data.medians || [];
      strokes = data.strokes || [];
      box.innerHTML = "";
      writer = HanziWriter.create(box, card.char, {
        width: SIZE,
        height: SIZE,
        padding: PAD,
        showOutline: true,
        showCharacter: false,
        strokeColor: "#3b3a5a",
        outlineColor: "#dcd3ff",
        drawingColor: "#3b3a5a",
        highlightColor: "#f2b23c",
        showHintAfterMisses: 3,
        charDataLoader: () => data,
      });

      // SVG overlay riêng, phủ tuyệt đối lên khung (không bị Hanzi Writer đè).
      const host = box.parentElement; // .hz-mi (position: relative)
      if (host) {
        overlay = document.createElementNS(NS, "svg");
        overlay.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
        overlay.setAttribute(
          "style",
          "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2;",
        );
        const g = document.createElementNS(NS, "g");
        g.setAttribute("transform", CHAR_TF);
        fillPath = document.createElementNS(NS, "path");
        fillPath.setAttribute("fill", GUIDE_COLOR);
        fillPath.setAttribute("stroke", "none");
        fillPath.style.opacity = "0";
        g.appendChild(fillPath);
        overlay.appendChild(g);

        hand = document.createElementNS(NS, "image") as SVGImageElement;
        hand.setAttribute("width", String(HW));
        hand.setAttribute("height", String(HW));
        hand.setAttribute("style", "filter:drop-shadow(0 3px 4px rgba(80,70,160,.4))");
        hand.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/emoji/1f446.png");
        hand.setAttribute("href", "/emoji/1f446.png");
        overlay.appendChild(hand);
        host.appendChild(overlay);
      }

      apiRef.current = { restart, demo };
      startQuiz();
    })();

    return () => {
      cancelled = true;
      clearHint();
      stopSpeaking();
      if (overlay) overlay.remove();
      if (box) box.innerHTML = "";
    };
  }, [card.char]);

  return (
    <div className="hz-step hz-step-write">
      <div className="hz-write-pass">
        {finished || done ? "Hoàn thành ✓" : `Lượt ${pass} / ${PASSES}`}
      </div>

      <div className="hz-mi">
        <div ref={boxRef} className="hz-mi-canvas" />
      </div>

      <div className="hz-write-actions">
        <button className="hz-write-btn" onClick={() => apiRef.current.demo()}>
          <span aria-hidden>👀</span> Xem mẫu
        </button>
        <button className="hz-write-btn alt" onClick={() => apiRef.current.restart()}>
          <span aria-hidden>✍️</span> Viết lại
        </button>
      </div>

      {(finished || done) && <p className="hz-practice-ok">Viết đẹp lắm! ⭐</p>}

      {showModal && (
        <div className="modal-back" role="dialog" aria-modal="true">
          <div className="modal result-modal lt-result">
            <button
              className="x"
              aria-label="Đóng"
              onClick={() => {
                stopSpeaking();
                setShowModal(false);
              }}
            >
              ✕
            </button>
            <div className="lt-result-emoji" aria-hidden>
              🎉
            </div>
            <h2>Bé viết đẹp lắm!</h2>
            <p>
              Bé đã viết xong chữ <b className="lt-zh-font">{card.char}</b> rồi. Bé
              muốn học chữ tiếp theo hay chọn chữ khác nào?
            </p>
            <div className="lt-result-actions">
              {hasNext && onNext && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    stopSpeaking();
                    onNext();
                  }}
                >
                  Học chữ tiếp theo →
                </button>
              )}
              {onBackToList && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    stopSpeaking();
                    onBackToList();
                  }}
                >
                  Chọn chữ khác
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
