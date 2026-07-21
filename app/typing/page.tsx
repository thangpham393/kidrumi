"use client";

import { useMemo, useRef, useState } from "react";
import { useToast } from "@/components/useToast";
import { useChild } from "@/components/ChildContext";

type Lang = "vi" | "en";
type LessonKey =
  | "home"
  | "top"
  | "bottom"
  | "all"
  | "words"
  | "lower"
  | "upper";

const banks: Record<Lang, Record<LessonKey, string[]>> = {
  vi: {
    home: ["a s d f", "j k l", "a f j k", "sàn nhà", "gà rả"],
    top: ["q w e r t", "y u i o p", "quê tôi", "rươi"],
    bottom: ["z x c v", "b n m", "con voi", "măm măm"],
    all: ["bé ngoan", "mẹ yêu con", "trời nắng", "con mèo con"],
    words: ["mèo", "cá", "hoa", "nhà", "bố", "mẹ", "gà", "chó", "cây", "bàn"],
    lower: ["con mèo kêu meo meo", "bé thích ăn cơm", "trời hôm nay nắng"],
    upper: ["Bé Bông rất ngoan.", "Hôm nay trời đẹp.", "Con yêu bố mẹ."],
  },
  en: {
    home: ["f j d k s l a ;", "ff jj dd kk", "ask a lad", "a sad fall"],
    top: ["q w e r t", "y u i o p", "try to write", "quiet pot"],
    bottom: ["z x c v", "b n m", "a big van", "come back"],
    all: ["the quick fox", "jump over it", "my little dog"],
    words: ["cat", "dog", "sun", "fish", "ball", "star", "book", "tree", "blue", "milk"],
    lower: ["the cat is on the mat", "i like to play", "a dog can run fast"],
    upper: ["The Sun Is Bright.", "I Love My Mom.", "We Can Read Books."],
  },
};

const lessonGroups: { g: string; items: { k: LessonKey; t: string; d: string }[] }[] =
  [
    {
      g: "⌨️ Từng phím",
      items: [
        { k: "home", t: "🏠 Hàng phím giữa", d: "f j d k s l a ;" },
        { k: "top", t: "☝️ Hàng phím trên", d: "q w e r t y u i o p" },
        { k: "bottom", t: "👇 Hàng phím dưới", d: "z x c v b n m" },
        { k: "all", t: "🌈 Cả bàn phím", d: "trộn tất cả chữ cái" },
      ],
    },
    {
      g: "🔤 Gõ từ",
      items: [{ k: "words", t: "🐱 Từ quen thuộc", d: "mèo, cá, hoa… / cat, dog…" }],
    },
    {
      g: "📖 Gõ câu",
      items: [
        { k: "lower", t: "🌱 Câu chữ thường", d: "câu ngắn, không viết hoa" },
        { k: "upper", t: "⭐ Câu viết hoa", d: "có Shift và dấu chấm" },
      ],
    },
  ];

export default function TypingPage() {
  const { showToast, toastEl } = useToast();
  const { addStars } = useChild();

  const [phase, setPhase] = useState<"setup" | "play">("setup");
  const [lang, setLang] = useState<Lang>("vi");
  const [lesson, setLesson] = useState<LessonKey>("words");

  const [queue, setQueue] = useState<string[]>([]);
  const [qi, setQi] = useState(0);
  const [typed, setTyped] = useState("");
  const [stars, setStars] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [acc, setAcc] = useState(100);
  const startTs = useRef(0);
  const totals = useRef({ typed: 0, err: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const target = queue[qi] ?? "";

  const buildQueue = () => {
    const pool = banks[lang][lesson] ?? banks[lang].words;
    let q: string[];
    if (lesson === "words") {
      q = Array.from({ length: 6 }, () =>
        [0, 1, 2].map(() => pool[Math.floor(Math.random() * pool.length)]).join(" ")
      );
    } else {
      q = [...pool].sort(() => Math.random() - 0.5);
    }
    setQueue(q);
    setQi(0);
    setTyped("");
    setStars(0);
    setWpm(0);
    setAcc(100);
    startTs.current = 0;
    totals.current = { typed: 0, err: 0 };
  };

  const start = () => {
    buildQueue();
    setPhase("play");
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const nextLine = () => {
    setQi((i) => (i + 1 >= queue.length ? 0 : i + 1));
    setTyped("");
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!startTs.current) startTs.current = Date.now();
    setTyped(v);

    if (v.length >= target.length && target.length > 0) {
      let err = 0;
      for (let i = 0; i < target.length; i++) if (v[i] !== target[i]) err++;
      totals.current.typed += target.length;
      totals.current.err += err;

      const gained = err === 0 ? 2 : err <= 2 ? 1 : 0;
      const newStars = stars + gained;
      setStars(newStars);
      if (gained > 0) addStars(gained);

      const mins = (Date.now() - startTs.current) / 60000;
      const words = totals.current.typed / 5;
      setWpm(mins > 0.02 ? Math.round(words / mins) : 0);
      setAcc(
        totals.current.typed
          ? Math.max(
              0,
              Math.round((1 - totals.current.err / totals.current.typed) * 100)
            )
          : 100
      );

      showToast(
        err === 0
          ? "Chính xác tuyệt đối! ⭐⭐"
          : err <= 2
          ? "Tốt lắm! ⭐"
          : "Cố lên nhé! 💪"
      );

      if (qi + 1 >= queue.length) {
        setTimeout(
          () => showToast(`Hoàn thành! Bé được ${newStars} sao 🌟`),
          400
        );
      }
      setTimeout(nextLine, 500);
    }
  };

  const chars = useMemo(() => {
    return target.split("").map((ch, i) => {
      let cls = "c";
      if (i < typed.length) cls += typed[i] === ch ? " done" : " bad";
      else if (i === typed.length) cls += " cur";
      return { ch: ch === " " ? " " : ch, cls, key: i };
    });
  }, [target, typed]);

  // ---------- SETUP ----------
  if (phase === "setup") {
    const hint =
      lang === "vi" ? (
        <>
          ⚠️ Bật bộ gõ tiếng Việt (Unikey — kiểu Telex) trước khi bắt đầu nhé!
          <br />
          <br />
          Gõ thử <b>as</b> → hiện <b>á</b> là đúng:
          <input placeholder="gõ vào đây…" />
        </>
      ) : (
        <>
          ⚠️ Tắt bộ gõ tiếng Việt (chuyển bàn phím sang English) trước khi bắt
          đầu nhé!
          <br />
          <br />
          Gõ thử <b>as</b> → vẫn là <b>as</b> là đúng:
          <input placeholder="gõ vào đây…" />
        </>
      );

    return (
      <main className="wrap">
        <h1 className="page-title">⌨️ Tập Gõ Phím Cùng Bé</h1>
        <p className="page-sub">Chọn ngôn ngữ và bài luyện rồi bấm Bắt đầu nhé!</p>

        <div className="panel" style={{ maxWidth: 680, margin: "0 auto" }}>
          <p className="section-label">NGÔN NGỮ</p>
          <div className="opt-row">
            <button
              className={`opt-tile ${lang === "vi" ? "on" : ""}`}
              onClick={() => setLang("vi")}
            >
              <div className="t">🇻🇳 Tiếng Việt</div>
            </button>
            <button
              className={`opt-tile ${lang === "en" ? "on" : ""}`}
              onClick={() => setLang("en")}
            >
              <div className="t">🇬🇧 English</div>
            </button>
          </div>

          <div className="hintbox">{hint}</div>

          <p className="section-label">BÀI LUYỆN</p>
          {lessonGroups.map((gr) => (
            <div key={gr.g}>
              <div
                style={{
                  fontWeight: 800,
                  color: "var(--ink-soft)",
                  margin: "12px 0 8px",
                }}
              >
                {gr.g}
              </div>
              <div className="opt-row">
                {gr.items.map((it) => (
                  <button
                    key={it.k}
                    className={`opt-tile ${lesson === it.k ? "on" : ""}`}
                    onClick={() => setLesson(it.k)}
                  >
                    <div className="t">{it.t}</div>
                    <div className="d">{it.d}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            className="btn btn-block"
            style={{ marginTop: 8 }}
            onClick={start}
          >
            Bắt đầu! 🚀
          </button>
        </div>
        {toastEl}
      </main>
    );
  }

  // ---------- PLAY ----------
  return (
    <main className="wrap">
      <div className="play-bar">
        <button className="pill" onClick={() => setPhase("setup")}>
          ← Cài đặt
        </button>
        <button className="pill on">
          Câu {qi + 1}/{queue.length}
        </button>
        <button className="pill" onClick={nextLine}>
          Câu tiếp →
        </button>
      </div>

      <div className="panel" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <div className="type-target">
          {chars.map((c) => (
            <span key={c.key} className={c.cls}>
              {c.ch}
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          className="type-input"
          value={typed}
          onChange={onInput}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Bấm vào đây rồi gõ theo mẫu…"
        />
        <div className="type-stats">
          <div className="s">
            <div className="n">{wpm}</div>
            <div className="l">Tốc độ (từ/phút)</div>
          </div>
          <div className="s">
            <div className="n">{acc}%</div>
            <div className="l">Chính xác</div>
          </div>
          <div className="s">
            <div className="n">{stars}</div>
            <div className="l">⭐ Sao</div>
          </div>
        </div>
      </div>
      {toastEl}
    </main>
  );
}
