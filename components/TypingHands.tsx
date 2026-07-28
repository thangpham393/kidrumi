"use client";

/**
 * Hai bàn tay clay minh hoạ: ngón cần dùng cho phím tiếp theo sẽ đổi màu +
 * "ấn" xuống nhè nhẹ, giúp bé biết đặt ngón nào của tay nào. Thuần trang trí.
 */

type Finger = "pinky" | "ring" | "middle" | "index" | "thumb";
type Hand = "left" | "right";

// Hình vẽ cho BÀN TAY PHẢI (ngón cái ở bên trái, mu bàn tay hướng ra).
// Tay trái = lật gương của hình này. viewBox 220×248.
function HandSvg({
  side,
  activeFinger,
}: {
  side: Hand;
  activeFinger: Finger | null;
}) {
  const cls = (f: Finger) =>
    `hand-finger f-${f} ${activeFinger === f ? "on" : ""}`;

  return (
    <svg viewBox="0 0 220 252" className={`hand-svg ${side}`}>
      <g transform={side === "left" ? "translate(220,0) scale(-1,1)" : ""}>
        {/* cổ tay (cuff pastel) */}
        <rect className="hand-cuff" x="58" y="206" width="108" height="46" rx="23" />
        <circle className="hand-btn" cx="112" cy="230" r="5.5" />
        {/* mu bàn tay — tròn mập */}
        <rect className="hand-cap" x="44" y="112" width="136" height="110" rx="54" />
        {/* 4 ngón bụ bẫm */}
        <rect className={cls("index")} x="54" y="72" width="34" height="86" rx="17" />
        <rect className={cls("middle")} x="90" y="56" width="36" height="102" rx="18" />
        <rect className={cls("ring")} x="128" y="70" width="34" height="88" rx="17" />
        <rect className={cls("pinky")} x="162" y="92" width="30" height="68" rx="15" />
        {/* ngón cái mập (xoay ra bên trái) */}
        <g transform="rotate(32 62 166)">
          <rect className={cls("thumb")} x="20" y="150" width="34" height="62" rx="17" />
        </g>
        {/* vệt sáng bóng clay + má hồng cho dễ thương */}
        <ellipse className="hand-shine" cx="82" cy="150" rx="20" ry="14" />
        <circle className="hand-blush" cx="72" cy="184" r="9" />
        <circle className="hand-blush" cx="150" cy="184" r="9" />
      </g>
    </svg>
  );
}

export default function TypingHands({
  finger,
  hand,
}: {
  finger: Finger | null;
  hand: Hand | null;
}) {
  return (
    <div className="hands">
      <div className="hand">
        <HandSvg side="left" activeFinger={hand === "left" ? finger : null} />
        <div className="hand-label">TAY TRÁI</div>
      </div>
      <div className="hand">
        <HandSvg side="right" activeFinger={hand === "right" ? finger : null} />
        <div className="hand-label">TAY PHẢI</div>
      </div>
    </div>
  );
}
