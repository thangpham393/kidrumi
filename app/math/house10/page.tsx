"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { useRecordActivity } from "@/lib/missions";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import Emoji from "@/components/Emoji";
import {
  FRIENDS,
  HAVE_MAX,
  HAVE_MIN,
  PRAISES,
  ROUNDS,
  TARGET,
  type Friend,
} from "./data";

// "Ngôi nhà số 10" — bài "làm bạn với số 10". Mỗi câu: ngôi nhà đã có sẵn `have` bạn
// ở trên; bé kéo (hoặc chạm) thêm bạn từ khay vào nhà cho đủ TARGET (10) rồi bấm
// "Xong!". Đúng → 1 ngôi sao (khen + pháo giấy). Thiếu/thừa → rung nhẹ, nghe nhắc,
// KHÔNG trừ điểm (bé chỉnh lại). Đúng đủ ROUNDS câu → mở lượt mừng.

const DRAG_THRESHOLD = 8; // px: quá ngưỡng này mới coi là "kéo" (nhỏ hơn = "chạm")

type Round = { friend: Friend; have: number; trayCount: number };

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Dựng một câu: bốc "bạn" (tránh trùng loại câu trước), chọn số đã có sẵn rồi để
// khay nhiều hơn số cần thêm 1–2 bạn → bé phải đếm đúng số còn thiếu, không bê hết.
function buildRound(avoidEmoji?: string): Round {
  let friend = pick(FRIENDS);
  let guard = 0;
  while (friend.emoji === avoidEmoji && guard++ < 20) friend = pick(FRIENDS);
  const have = rand(HAVE_MIN, HAVE_MAX);
  const need = TARGET - have;
  const trayCount = need + rand(1, 2); // thừa 1–2 bạn làm nhiễu
  return { friend, have, trayCount };
}

const promptFor = (r: Round) =>
  `Có ${r.have} bạn ở trên. Hãy thêm để có tất cả ${TARGET}.`;

type Drag = { x: number; y: number; emoji: string };

export default function House10Page() {
  const { addStars } = useChild();
  const record = useRecordActivity();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — buildRound()
  // dùng Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [added, setAdded] = useState(0); // số bạn bé đã thêm vào nhà
  const [completed, setCompleted] = useState(0); // số câu đúng = số sao
  const [solved, setSolved] = useState<{ have: number; added: number } | null>(null); // phép tính khi đúng
  const [drag, setDrag] = useState<Drag | null>(null); // bạn đang bay theo ngón tay
  const [overHouse, setOverHouse] = useState(false); // đang rê bạn tới cửa nhà
  const [wrong, setWrong] = useState(false); // vừa bấm Xong nhưng chưa đủ/thừa (rung)
  const [done, setDone] = useState(false);
  // Xong 1 ván (đủ số câu) → ghi nhận nhiệm vụ Vườn Toán.
  useEffect(() => {
    if (done) record("math", "house10");
  }, [done, record]);

  const houseRef = useRef<HTMLDivElement | null>(null);
  const press = useRef<{ x0: number; y0: number; moved: boolean } | null>(null);
  // Mirror state để logic đồng bộ (tránh closure cũ khi bé thao tác nhanh).
  const roundRef = useRef<Round | null>(null);
  const addedRef = useRef(0);
  const completedRef = useRef(0);
  const transitioning = useRef(false); // đang chấm/chuyển câu → khoá thao tác

  const start = useCallback(() => {
    const r = buildRound();
    roundRef.current = r;
    addedRef.current = 0;
    completedRef.current = 0;
    transitioning.current = false;
    setRound(r);
    setAdded(0);
    setCompleted(0);
    setSolved(null);
    setDrag(null);
    setOverHouse(false);
    setWrong(false);
    setDone(false);
    void speak(promptFor(r), "vi");
  }, []);

  // Khởi tạo ở client (tránh random khi SSR); dừng đọc khi rời trang.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
    return () => stopSpeaking();
  }, [start]);

  const pointInHouse = useCallback((x: number, y: number): boolean => {
    const box = houseRef.current?.getBoundingClientRect();
    return !!box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
  }, []);

  // Thêm một bạn vào nhà (từ khay). Chỉ thêm khi còn bạn trong khay.
  const addOne = useCallback((x?: number, y?: number) => {
    const r = roundRef.current;
    if (transitioning.current || !r) return;
    if (addedRef.current >= r.trayCount) return;
    const na = addedRef.current + 1;
    addedRef.current = na;
    setAdded(na);
    confettiBurst(x, y);
  }, []);

  // Bỏ bớt một bạn vừa thêm (chạm vào bạn trong nhà).
  const removeOne = useCallback(() => {
    if (transitioning.current) return;
    const na = Math.max(0, addedRef.current - 1);
    addedRef.current = na;
    setAdded(na);
  }, []);

  const nextRound = useCallback(() => {
    const next = buildRound(roundRef.current?.friend.emoji);
    roundRef.current = next;
    addedRef.current = 0;
    setRound(next);
    setAdded(0);
    setSolved(null);
    setDrag(null);
    setOverHouse(false);
    setWrong(false);
    transitioning.current = false;
    void speak(promptFor(next), "vi");
  }, []);

  // Bấm "Xong!" — chấm câu hiện tại.
  const check = useCallback(() => {
    const r = roundRef.current;
    if (transitioning.current || !r) return;
    const total = r.have + addedRef.current;
    if (total === TARGET) {
      transitioning.current = true;
      playSuccess();
      confettiBurst();
      addStars(1);
      const add = addedRef.current;
      // Hiện phép tính "have + added = 10" và đọc kết quả bằng Google TTS.
      setSolved({ have: r.have, added: add });
      void speak(`${r.have} cộng ${add} bằng ${TARGET}`, "vi");
      const nc = completedRef.current + 1;
      completedRef.current = nc;
      setCompleted(nc);
      showToast(`${pick(PRAISES)} 🎉`);
      if (nc >= ROUNDS) {
        setTimeout(() => {
          setDone(true);
          confettiBurst();
          playSuccess();
        }, 1900);
        return;
      }
      setTimeout(() => nextRound(), 2200);
    } else {
      // Thiếu hoặc thừa: rung nhẹ, nghe nhắc, không trừ điểm.
      playWrong();
      const msg =
        total < TARGET
          ? `Chưa đủ ${TARGET} đâu, thêm bạn nữa nhé!`
          : `Nhiều hơn ${TARGET} rồi, bớt một bạn nhé!`;
      setWrong(true);
      void speak(msg, "vi");
      setTimeout(() => setWrong(false), 600);
    }
  }, [addStars, showToast, nextRound]);

  // ---- Kéo bạn từ khay bằng con trỏ (chuột + cảm ứng) ----
  function onPointerDown(e: React.PointerEvent) {
    if (transitioning.current || done) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    press.current = { x0: e.clientX, y0: e.clientY, moved: false };
  }

  function onPointerMove(e: React.PointerEvent) {
    const p = press.current;
    if (!p) return;
    const dist = Math.hypot(e.clientX - p.x0, e.clientY - p.y0);
    if (!p.moved && dist > DRAG_THRESHOLD) p.moved = true;
    if (p.moved) {
      const emoji = roundRef.current?.friend.emoji ?? "";
      setDrag({ x: e.clientX, y: e.clientY, emoji });
      setOverHouse(pointInHouse(e.clientX, e.clientY));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const p = press.current;
    press.current = null;
    if (!p) return;
    if (p.moved) {
      const over = pointInHouse(e.clientX, e.clientY);
      setDrag(null);
      setOverHouse(false);
      if (over) addOne(e.clientX, e.clientY);
    } else {
      // Chạm (không kéo): thêm một bạn, nổ pháo giấy tại điểm chạm.
      addOne(e.clientX, e.clientY);
    }
  }

  const remaining = round ? round.trayCount - added : 0;
  const roundNo = Math.min(completed + 1, ROUNDS);
  const prompt = round ? promptFor(round) : "";
  const friend = round?.friend;

  return (
    <main className="wrap h10-wrap">
      <div className="lt-top">
        <Link href="/math" className="pill">
          ← Trò chơi
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>🏡</span> Ngôi nhà số 10
        </h1>
        <button
          type="button"
          className="lt-replay"
          onClick={() => round && void speak(prompt, "vi")}
          disabled={!round}
          aria-label="Nghe lại lời nhắc"
          title="Nghe lại"
        >
          🔊
        </button>
      </div>

      <div className="lt-stars" aria-label={`Đã xong ${completed} trên ${ROUNDS} câu`}>
        {Array.from({ length: ROUNDS }, (_, i) => (
          <span key={i} className={`lt-star ${i < completed ? "on" : ""}`} aria-hidden>
            {i < completed ? "⭐" : "☆"}
          </span>
        ))}
      </div>
      <p className="sort-round">Câu {roundNo} / {ROUNDS}</p>

      {round && friend && (
        <>
          <button
            type="button"
            className="lt-prompt h10-prompt"
            onClick={() => void speak(prompt, "vi")}
            aria-label={`Nghe lại: ${prompt}`}
          >
            <span className="lt-prompt-ic" aria-hidden>
              🔊
            </span>
            <span className="lt-prompt-body">
              <span className="lt-prompt-text">{prompt}</span>
            </span>
          </button>

          <div
            ref={houseRef}
            className={"h10-house" + (overHouse ? " over" : "") + (wrong ? " wrong" : "")}
            aria-label={`Ngôi nhà đang có ${round.have + added} bạn`}
          >
            <div className="h10-roof" aria-hidden />
            <div className="h10-body">
              <div className="h10-shelf">
                {/* Các bạn có sẵn (không bỏ ra được) */}
                {Array.from({ length: round.have }, (_, j) => (
                  <span key={`have-${j}`} className="h10-bear" aria-hidden>
                    <Emoji emoji={friend.emoji} className="h10-bear-em" />
                  </span>
                ))}
                {/* Các bạn bé vừa thêm — chạm để bỏ ra */}
                {Array.from({ length: added }, (_, j) => (
                  <button
                    key={`add-${j}`}
                    type="button"
                    className="h10-bear h10-added"
                    onClick={removeOne}
                    aria-label="Bỏ bớt một bạn"
                  >
                    <Emoji emoji={friend.emoji} className="h10-bear-em" />
                  </button>
                ))}
              </div>
              {solved && (
                <div
                  className="h10-eq"
                  role="status"
                  aria-label={`${solved.have} cộng ${solved.added} bằng ${TARGET}`}
                >
                  <div className="h10-eq-card" aria-hidden>
                    <span className="h10-eq-n">{solved.have}</span>
                    <span className="h10-eq-op">+</span>
                    <span className="h10-eq-n">{solved.added}</span>
                    <span className="h10-eq-op">=</span>
                    <span className="h10-eq-r">{TARGET}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h10-bar">
            <div className="h10-tray" aria-label="Khay bạn để thêm vào nhà">
              {Array.from({ length: remaining }, (_, j) => (
                <button
                  key={`tray-${j}`}
                  type="button"
                  className={"h10-chip" + (drag && j === 0 ? " dragging" : "")}
                  style={{ touchAction: "none" }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  aria-label={`Thêm 1 ${friend.vi}`}
                >
                  <Emoji emoji={friend.emoji} className="h10-chip-em" />
                </button>
              ))}
              {remaining === 0 && (
                <span className="h10-tray-empty" aria-hidden>
                  Hết bạn trong khay
                </span>
              )}
            </div>
            <button type="button" className="btn h10-done" onClick={check}>
              ✓ Xong!
            </button>
          </div>
        </>
      )}

      {drag && (
        <div className="h10-float" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <Emoji emoji={drag.emoji} className="h10-chip-em" />
        </div>
      )}

      {done && (
        <div className="modal-back" role="dialog" aria-modal="true">
          <div className="modal result-modal lt-result">
            <div className="lt-result-emoji" aria-hidden>
              🎉
            </div>
            <h2>Tuyệt vời!</h2>
            <p>
              Bé làm đủ {ROUNDS} ngôi nhà số {TARGET} rồi. Giỏi quá đi! Được {ROUNDS}{" "}
              ngôi sao ⭐
            </p>
            <div className="lt-result-actions">
              <button type="button" className="btn" onClick={start}>
                Chơi lại →
              </button>
              <Link href="/math" className="btn-ghost">
                Về Vườn Toán
              </Link>
            </div>
          </div>
        </div>
      )}

      {toastEl}
    </main>
  );
}
