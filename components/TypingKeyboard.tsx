"use client";

import TypingHands from "@/components/TypingHands";

/**
 * Bàn phím ảo hướng dẫn bé gõ 10 ngón: tô màu phím theo ngón tay, làm nổi
 * phím tiếp theo cần gõ (theo mẫu) và nhắc "ngón nào, tay nào". Chỉ dùng để
 * minh hoạ trực quan — không nhận input, bé vẫn gõ vào ô nhập như cũ.
 */

type Finger = "pinky" | "ring" | "middle" | "index" | "thumb";
type Hand = "left" | "right";

// Mỗi phím → ngón + tay theo cách gõ 10 ngón chuẩn.
const FINGER: Record<string, { f: Finger; h: Hand }> = {
  q: { f: "pinky", h: "left" }, a: { f: "pinky", h: "left" }, z: { f: "pinky", h: "left" },
  w: { f: "ring", h: "left" }, s: { f: "ring", h: "left" }, x: { f: "ring", h: "left" },
  e: { f: "middle", h: "left" }, d: { f: "middle", h: "left" }, c: { f: "middle", h: "left" },
  r: { f: "index", h: "left" }, f: { f: "index", h: "left" }, v: { f: "index", h: "left" },
  t: { f: "index", h: "left" }, g: { f: "index", h: "left" }, b: { f: "index", h: "left" },
  y: { f: "index", h: "right" }, h: { f: "index", h: "right" }, n: { f: "index", h: "right" },
  u: { f: "index", h: "right" }, j: { f: "index", h: "right" }, m: { f: "index", h: "right" },
  i: { f: "middle", h: "right" }, k: { f: "middle", h: "right" }, ",": { f: "middle", h: "right" },
  o: { f: "ring", h: "right" }, l: { f: "ring", h: "right" }, ".": { f: "ring", h: "right" },
  p: { f: "pinky", h: "right" }, ";": { f: "pinky", h: "right" },
  " ": { f: "thumb", h: "right" },
};

const FINGER_VI: Record<Finger, string> = {
  pinky: "Ngón út",
  ring: "Ngón áp út",
  middle: "Ngón giữa",
  index: "Ngón trỏ",
  thumb: "Ngón cái",
};

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
  ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "shift"],
];

// Dấu thanh (tổ hợp Unicode) → phím Telex tương ứng.
const TONE: Record<string, string> = {
  "̀": "f", // huyền
  "́": "s", // sắc
  "̃": "x", // ngã
  "̉": "r", // hỏi
  "̣": "j", // nặng
};

// Phân tích 1 ký tự tiếng Việt thành chuỗi phím gõ kiểu Telex.
// à → [a,f] · ê → [e,e] · ấ → [a,a,s] · ắ → [a,w,s] · ự → [u,w,j] · đ → [d,d]
function telexKeys(ch: string): string[] {
  const lower = ch.toLowerCase();
  if (lower === "đ") return ["d", "d"];
  const nfd = lower.normalize("NFD");
  const base = nfd[0] ?? lower;
  const marks = nfd.slice(1);
  let keys: string[];
  if (marks.includes("̂")) keys = [base, base]; // mũ: â ê ô
  else if (marks.includes("̆")) keys = [base, "w"]; // á ngắn: ă
  else if (marks.includes("̛")) keys = [base, "w"]; // móc: ơ ư
  else keys = [base];
  for (const m of marks) if (TONE[m]) keys.push(TONE[m]);
  return keys;
}

// Phím vật lý tiếp theo bé cần bấm, xét theo những gì đã gõ.
function computeNextKey(target: string, typed: string, lang: "vi" | "en"): string {
  if (!target) return "";
  let k = 0;
  while (k < target.length && k < typed.length && typed[k] === target[k]) k++;
  if (k >= target.length) return "";
  const ch = target[k];
  if (ch === " ") return " ";
  if (lang !== "vi") return ch.toLowerCase();

  const full = telexKeys(ch);
  let done = 0;
  const partial = typed[k]; // ký tự đang hình thành tại vị trí này (vd 'a' của 'à')
  if (partial && partial !== ch) {
    const ps = telexKeys(partial);
    const isPrefix = ps.length <= full.length && ps.every((x, i) => x === full[i]);
    done = isPrefix ? ps.length : 0;
  }
  return full[Math.min(done, full.length - 1)] || ch.toLowerCase();
}

export default function TypingKeyboard({
  target,
  typed,
  lang,
}: {
  target: string;
  typed: string;
  lang: "vi" | "en";
}) {
  const key = computeNextKey(target, typed, lang);
  const active = FINGER[key];
  const isSpace = key === " ";

  return (
    <div className="kbd" aria-hidden>
     <div className="kbd-main">
      <div className="kbd-keys">
      {ROWS.map((row, ri) => (
        <div className="kbd-row" key={ri}>
          {row.map((k, ci) => {
            if (k === "shift") {
              return (
                <span className="kbd-key wide dim" key={`sh${ci}`}>
                  ⇧ Shift
                </span>
              );
            }
            const info = FINGER[k];
            const on = !isSpace && k === key;
            return (
              <span
                className={`kbd-key f-${info.f} ${on ? "on" : ""}`}
                key={k}
              >
                {k === "," ? "," : k === "." ? "." : k === ";" ? ";" : k.toUpperCase()}
              </span>
            );
          })}
        </div>
      ))}

      <div className="kbd-row">
        <span className={`kbd-key space f-thumb ${isSpace ? "on" : ""}`}>
          Space
        </span>
      </div>
      </div>

      <div className="kbd-side">
        <TypingHands
          finger={active ? active.f : null}
          hand={active ? active.h : null}
        />
        {active && (
          <div className="kbd-hint">
            <span className={`kbd-dot f-${active.f}`} />
            {FINGER_VI[active.f]} {active.h === "left" ? "tay trái" : "tay phải"}
            {isSpace ? " · phím cách" : ""}
          </div>
        )}
      </div>
     </div>

      <div className="kbd-legend">
        {(["pinky", "ring", "middle", "index", "thumb"] as Finger[]).map((f) => (
          <span className="kbd-leg" key={f}>
            <span className={`kbd-dot f-${f}`} />
            {FINGER_VI[f]}
          </span>
        ))}
      </div>
    </div>
  );
}
