"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/useToast";
import { useChild } from "@/components/ChildContext";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";

type Op = "+" | "-" | "×" | "÷";
type Mark = "instant" | "end";
type Q = {
  a: number;
  b: number;
  op: Op;
  ans: number;
  val: string;
  state: "" | "correct" | "wrong";
};

const opClass: Record<Op, string> = {
  "+": "op-add",
  "-": "op-sub",
  "×": "op-mul",
  "÷": "op-div",
};

function rnd(n: number) {
  return Math.floor(Math.random() * n);
}

function makeQ(ops: Op[], range: number): Q {
  const op = ops[rnd(ops.length)] ?? "+";
  const R = range;
  let a: number, b: number, ans: number;
  if (op === "+") {
    a = rnd(R) + 1;
    b = rnd(R - a + 1);
    ans = a + b;
  } else if (op === "-") {
    a = rnd(R) + 1;
    b = rnd(a) + 1;
    if (b > a) [a, b] = [b, a];
    ans = a - b;
  } else if (op === "×") {
    const m = Math.max(2, Math.min(12, Math.floor(Math.sqrt(R))));
    a = rnd(m) + 1;
    b = rnd(m) + 1;
    ans = a * b;
  } else {
    b = rnd(9) + 2;
    ans = rnd(Math.max(2, Math.floor(R / b))) + 1;
    a = b * ans;
  }
  return { a, b, op, ans, val: "", state: "" };
}

export default function MathPage() {
  const { showToast, toastEl } = useToast();
  const { addStars } = useChild();

  const [phase, setPhase] = useState<"setup" | "play">("setup");
  const [ops, setOps] = useState<Op[]>(["+", "-"]);
  const [range, setRange] = useState(100);
  const [count, setCount] = useState(20);
  const [mark, setMark] = useState<Mark>("instant");

  const [questions, setQuestions] = useState<Q[]>([]);
  const [sel, setSel] = useState(0);
  const [padOpen, setPadOpen] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number } | null>(
    null
  );

  const correct = useMemo(
    () => questions.filter((q) => q.state === "correct").length,
    [questions]
  );

  const toggleOp = (op: Op) =>
    setOps((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]
    );

  const generate = useCallback(() => {
    const activeOps: Op[] = ops.length ? ops : ["+"];
    const list: Q[] = [];
    const seen = new Set<string>();
    // Try to keep every problem unique within the round…
    let guard = 0;
    while (list.length < count && guard < count * 40) {
      guard++;
      const q = makeQ(activeOps, range);
      // + and × are commutative, so treat 5+0 and 0+5 as the same problem.
      const [x, y] =
        q.op === "+" || q.op === "×" ? [q.a, q.b].sort((m, n) => m - n) : [q.a, q.b];
      const key = `${x}${q.op}${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(q);
    }
    // …but if the range is too small to fill without repeats, allow the rest.
    while (list.length < count) list.push(makeQ(activeOps, range));
    setQuestions(list);
    setSel(0);
    setResult(null);
    setPadOpen(false);
  }, [ops, range, count]);

  // Redo the current problems: clear answers and marks, keep the questions.
  const retry = useCallback(() => {
    setQuestions((prev) => prev.map((q) => ({ ...q, val: "", state: "" })));
    setSel(0);
    setResult(null);
    setPadOpen(false);
  }, []);

  const start = () => {
    generate();
    setPhase("play");
  };

  const press = useCallback(
    (k: string) => {
      if (k === "ok") {
        const cur = questions[sel];
        if (!cur || cur.val === "") return;
        if (mark === "instant") {
          const isRight = Number(cur.val) === cur.ans;
          setQuestions((prev) => {
            const next = [...prev];
            next[sel] = { ...next[sel], state: isRight ? "correct" : "wrong" };
            return next;
          });
          if (isRight) {
            showToast("Giỏi quá! 🎉");
            addStars(1);
            playSuccess();
            const rect = document
              .querySelector(".q-card.sel")
              ?.getBoundingClientRect();
            confettiBurst(
              rect ? rect.left + rect.width / 2 : undefined,
              rect ? rect.top + rect.height / 2 : undefined
            );
            // Round finished once this one and all others are correct.
            const done = questions.every((q, i) => i === sel || q.state === "correct");
            if (done) {
              setPadOpen(false);
              setResult({ correct: questions.length, total: questions.length });
              return;
            }
          } else {
            playWrong();
          }
        }
        setSel((s) => {
          const idx = questions.findIndex(
            (x, i) => i > s && x.state !== "correct"
          );
          return idx >= 0 ? idx : s;
        });
        return;
      }

      setQuestions((prev) => {
        const next = [...prev];
        const q = { ...next[sel] };
        if (!q) return prev;
        if (k === "del") {
          q.val = q.val.slice(0, -1);
          q.state = "";
        } else {
          if (q.val.length < 4) q.val += k;
          q.state = "";
        }
        next[sel] = q;
        return next;
      });
    },
    [sel, mark, questions, showToast, addStars]
  );

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") press(e.key);
      else if (e.key === "Backspace") press("del");
      else if (e.key === "Enter") press("ok");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, press]);

  // On phones the keypad is a bottom sheet that covers part of the list —
  // keep the active question visible above it whenever selection changes.
  useEffect(() => {
    if (!padOpen) return;
    if (!window.matchMedia("(max-width: 720px)").matches) return;
    const el = document.querySelector(".q-card.sel");
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [sel, padOpen]);

  const checkAll = () => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.val !== ""
          ? { ...q, state: Number(q.val) === q.ans ? "correct" : "wrong" }
          : q
      )
    );
    const c = questions.filter((q) => Number(q.val) === q.ans).length;
    if (c > 0) {
      playSuccess();
      confettiBurst();
    } else {
      playWrong();
    }
    setPadOpen(false);
    setResult({ correct: c, total: questions.length });
  };

  // ---------- SETUP ----------
  if (phase === "setup") {
    return (
      <main className="wrap">
        <h1 className="page-title">🧮 Học Toán Cùng Bé</h1>
        <p className="page-sub">Chọn phép tính rồi bấm Bắt đầu nhé!</p>

        <div className="panel" style={{ maxWidth: 680, margin: "0 auto" }}>
          <p className="section-label">PHÉP TÍNH</p>
          <div className="opt-row">
            {(
              [
                ["+", "Cộng", "op-plus"],
                ["-", "Trừ", "op-minus"],
                ["×", "Nhân", ""],
                ["÷", "Chia", ""],
              ] as [Op, string, string][]
            ).map(([op, label, extra]) => (
              <button
                key={op}
                className={`opt-tile ${extra} ${ops.includes(op) ? "on" : ""}`}
                onClick={() => toggleOp(op)}
              >
                <div className="big">{op === "-" ? "−" : op}</div>
                <div className="t">{label}</div>
              </button>
            ))}
          </div>

          <p className="section-label">PHẠM VI (SỐ LỚN NHẤT TRONG BÀI)</p>
          <div className="opt-row">
            {[10, 20, 50, 100].map((r) => (
              <button
                key={r}
                className={`chip ${range === r ? "on" : ""}`}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <p className="section-label">SỐ LƯỢNG BÀI</p>
          <div className="opt-row">
            {[10, 20, 30].map((c) => (
              <button
                key={c}
                className={`chip ${count === c ? "on" : ""}`}
                onClick={() => setCount(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <p className="section-label">CÁCH CHẤM ĐIỂM</p>
          <div className="opt-row">
            <button
              className={`opt-tile ${mark === "instant" ? "on" : ""}`}
              onClick={() => setMark("instant")}
            >
              <div className="t">⚡ Chấm ngay</div>
              <div className="d">Bấm ✓ là biết đúng sai liền</div>
            </button>
            <button
              className={`opt-tile ${mark === "end" ? "on" : ""}`}
              onClick={() => setMark("end")}
            >
              <div className="t">🏁 Chấm cuối</div>
              <div className="d">Làm hết rồi bấm Kiểm tra</div>
            </button>
          </div>

          <button className="btn btn-block" onClick={start}>
            Bắt đầu! 🚀
          </button>
        </div>
        {toastEl}
      </main>
    );
  }

  // ---------- PLAY ----------
  return (
    <>
      <main className={`wrap ${padOpen ? "pad-space" : ""}`}>
        <div className="play-bar">
          <button className="pill" onClick={() => setPhase("setup")}>
            ← Cài đặt
          </button>
          <button className="pill on">
            ⭐ Đúng {correct}/{questions.length}
          </button>
          <button className="pill" onClick={generate}>
            🔀
          </button>
          {mark === "end" && (
            <button className="pill" onClick={checkAll}>
              Kiểm tra
            </button>
          )}
        </div>

        <div className="q-grid">
          {questions.map((q, i) => (
            <div
              key={i}
              className={`q-card ${i === sel ? "sel" : ""} ${q.state}`}
              onClick={() => {
                setSel(i);
                setPadOpen(true);
              }}
            >
              <span className={`q-badge ${q.state === "correct" ? "done" : ""}`}>
                {i + 1}
              </span>
              <span className="q-expr">
                {q.a} <span className={opClass[q.op]}>{q.op}</span> {q.b} =
              </span>
              <span className="q-ans">{q.val}</span>
            </div>
          ))}
        </div>
      </main>

      <div className={`pad ${padOpen ? "open" : ""}`}>
        <button
          className="pad-close"
          onClick={() => setPadOpen(false)}
          aria-label="Đóng bàn phím"
        >
          <span className="pad-handle" />
        </button>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
          <button key={k} onClick={() => press(k)}>
            {k}
          </button>
        ))}
        <button className="del" onClick={() => press("del")}>
          ⌫
        </button>
        <button onClick={() => press("0")}>0</button>
        <button className="ok" onClick={() => press("ok")}>
          ✓
        </button>
      </div>

      {result && (
        <div className="modal-back">
          <div className="modal result-modal">
            <div className="result-bot">🤖</div>
            {(() => {
              const { correct, total } = result;
              const perfect = correct === total;
              const good = correct / total >= 0.7;
              return (
                <>
                  <h3 className="result-title">
                    {perfect ? "Tuyệt vời! 🎉" : good ? "Giỏi lắm! 🌟" : "Cố lên nhé! 💪"}
                  </h3>
                  <div className="result-score">
                    {correct}/{total}
                  </div>
                  <p className="result-sub">
                    {perfect
                      ? "Bé làm đúng hết luôn, siêu quá!"
                      : good
                      ? "Bé làm tốt lắm, cố thêm chút nữa nhé!"
                      : "Cùng luyện thêm cho giỏi hơn nhé!"}
                  </p>
                </>
              );
            })()}

            <button className="btn btn-block" onClick={generate}>
              Đề mới 🎲
            </button>
            <button className="btn btn-ghost btn-block" onClick={retry}>
              Làm lại đề này 🔁
            </button>
            <button
              className="result-link"
              onClick={() => {
                setResult(null);
                setPadOpen(false);
                setPhase("setup");
              }}
            >
              Đổi cài đặt ⚙️
            </button>
          </div>
        </div>
      )}
      {toastEl}
    </>
  );
}
