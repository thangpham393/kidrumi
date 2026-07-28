/* ---------------------------------------------------------------------------
   Nhân vật bạn đồng hành — vẽ bằng SVG cho cả 9 thế giới.

   Mỗi thế giới một nhân vật riêng (bạch tuộc, tên lửa, mặt trời, khủng long,
   xe đua, công chúa, robot, thỏ, cá mập). Tô khối mềm (gradient tròn + bóng)
   cho cảm giác "đất nặn" pastel như DESIGN.md, không phẳng như icon vector.

   Chuyển động mượt bằng CSS (namespace .bd-* trong globals.css):
     • .bd-float  — cả thân nổi/nhún nhẹ khi rảnh; đổi sang nhịp "cheer" nhanh
       khi bé xong việc (thêm class .cheer ở <svg>).
     • .bd-blink / .bd-sway / .bd-spin / .bd-flicker… — cử động từng bộ phận.
   Tất cả tắt khi prefers-reduced-motion (xem globals.css).

   Đây là lớp DỰ PHÒNG đẹp khi chưa có ảnh sprite clay thật. Khi thả
   /themes/<key>/swim1..4.webp + cheer1..4.webp vào public, ThemeBuddy sẽ ưu
   tiên flipbook ảnh thật thay cho SVG này.
--------------------------------------------------------------------------- */

import type { ReactElement } from "react";

type Props = { world: string; cheering?: boolean };

/* Bóng đổ mềm dưới chân — dùng chung cho mọi nhân vật. */
function Shadow() {
  return (
    <ellipse className="bd-shadow" cx="60" cy="123" rx="26" ry="6" fill="rgba(20,16,54,.22)" />
  );
}

/* Cặp mắt tròn long lanh + chớp mắt. cx là tâm mỗi mắt. */
function Eyes({ y = 54, dx = 9, r = 5.4 }: { y?: number; dx?: number; r?: number }) {
  return (
    <g className="bd-blink" style={{ transformOrigin: `60px ${y}px` }}>
      {[-dx, dx].map((x) => (
        <g key={x}>
          <circle cx={60 + x} cy={y} r={r} fill="#2b2a44" />
          <circle cx={60 + x + r * 0.32} cy={y - r * 0.34} r={r * 0.34} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

/* Má hồng. */
function Cheeks({ y = 62, dx = 20, fill = "#ff9ec4" }: { y?: number; dx?: number; fill?: string }) {
  return (
    <>
      <ellipse cx={60 - dx} cy={y} rx="5" ry="3.6" fill={fill} opacity=".7" />
      <ellipse cx={60 + dx} cy={y} rx="5" ry="3.6" fill={fill} opacity=".7" />
    </>
  );
}

/* Miệng cười — nét cong đơn giản, mở to hơn khi ăn mừng. */
function Smile({ y = 66, cheer = false }: { y?: number; cheer?: boolean }) {
  return cheer ? (
    <path d={`M52 ${y} Q60 ${y + 9} 68 ${y}`} fill="#7a2f4a" stroke="#7a2f4a" strokeWidth="2" strokeLinecap="round" />
  ) : (
    <path d={`M54 ${y} Q60 ${y + 6} 66 ${y}`} fill="none" stroke="#7a2f4a" strokeWidth="2.4" strokeLinecap="round" />
  );
}

/* ---- Bạch tuộc (Đại dương) ---- */
function Octopus({ cheer }: { cheer: boolean }) {
  const legs = [-24, -12, 0, 12, 24];
  return (
    <g>
      <defs>
        <radialGradient id="oc-body" cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#a99bff" />
          <stop offset="60%" stopColor="#7d6ff0" />
          <stop offset="100%" stopColor="#5f52c7" />
        </radialGradient>
      </defs>
      <Shadow />
      {legs.map((x, i) => (
        <path
          key={x}
          className={`bd-sway bd-sway-${i % 2 ? "b" : "a"}`}
          style={{ transformOrigin: `${60 + x * 0.5}px 92px`, animationDelay: `${i * 0.12}s` }}
          d={`M${60 + x * 0.5} 90 q ${x * 0.7} 12 ${x} 26 q 3 6 -4 8 q -8 -12 ${-x * 0.5} -22`}
          fill="url(#oc-body)"
        />
      ))}
      <path d="M60 30 q26 0 26 34 q0 20 -26 28 q-26 -8 -26 -28 q0 -34 26 -34Z" fill="url(#oc-body)" />
      <ellipse cx="60" cy="44" rx="17" ry="12" fill="#fff" opacity=".18" />
      <Eyes y={52} dx={10} r={6} />
      <Cheeks y={62} dx={22} fill="#67d3df" />
      <Smile y={66} cheer={cheer} />
    </g>
  );
}

/* ---- Tên lửa (Vũ trụ) ---- */
function Rocket({ cheer }: { cheer: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="rk-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="55%" stopColor="#e7e2ff" />
          <stop offset="100%" stopColor="#c3b8f2" />
        </linearGradient>
        <linearGradient id="rk-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd858" />
          <stop offset="60%" stopColor="#ff9a3c" />
          <stop offset="100%" stopColor="#ef6758" />
        </linearGradient>
      </defs>
      <Shadow />
      <path className="bd-flicker" style={{ transformOrigin: "60px 100px" }}
        d="M50 98 q10 26 10 26 q0 0 10 -26 q-10 8 -20 0Z" fill="url(#rk-flame)" />
      <path d="M42 96 q-14 2 -16 14 q14 -2 18 -8Z" fill="#d687e7" />
      <path d="M78 96 q14 2 16 14 q-14 -2 -18 -8Z" fill="#d687e7" />
      <path d="M60 24 q20 20 18 50 q-2 22 -18 26 q-16 -4 -18 -26 q-2 -30 18 -50Z" fill="url(#rk-body)" />
      <circle cx="60" cy="56" r="12" fill="#7867d8" />
      <circle cx="60" cy="56" r="12" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="64" cy="52" r="3.5" fill="#fff" opacity=".8" />
      <Eyes y={56} dx={5} r={3.4} />
      <Smile y={64} cheer={cheer} />
    </g>
  );
}

/* ---- Mặt trời (Vườn nắng) ---- */
function Sun({ cheer }: { cheer: boolean }) {
  const rays = Array.from({ length: 12 });
  return (
    <g>
      <defs>
        <radialGradient id="sn-body" cx="42%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#ffe9a3" />
          <stop offset="60%" stopColor="#ffd147" />
          <stop offset="100%" stopColor="#f2a41f" />
        </radialGradient>
      </defs>
      <Shadow />
      <g className="bd-spin" style={{ transformOrigin: "60px 62px" }}>
        {rays.map((_, i) => (
          <rect key={i} x="58" y="16" width="4" height="14" rx="2" fill="#ffce4d"
            transform={`rotate(${i * 30} 60 62)`} />
        ))}
      </g>
      <circle cx="60" cy="62" r="30" fill="url(#sn-body)" />
      <ellipse cx="52" cy="52" rx="12" ry="9" fill="#fff" opacity=".2" />
      <Eyes y={60} dx={11} r={5.4} />
      <Cheeks y={70} dx={20} fill="#ff8f5e" />
      <Smile y={72} cheer={cheer} />
    </g>
  );
}

/* ---- Khủng long (Thung lũng) ---- */
function Dino({ cheer }: { cheer: boolean }) {
  return (
    <g>
      <defs>
        <radialGradient id="dn-body" cx="42%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#8fd08a" />
          <stop offset="60%" stopColor="#62a95f" />
          <stop offset="100%" stopColor="#427e46" />
        </radialGradient>
      </defs>
      <Shadow />
      <path className="bd-sway bd-sway-a" style={{ transformOrigin: "40px 96px" }}
        d="M40 92 q-20 2 -26 16 q10 4 22 -2 q6 -4 8 -10Z" fill="url(#dn-body)" />
      <path d="M60 40 q24 2 24 34 q0 24 -24 26 q-24 -2 -24 -26 q0 -32 24 -34Z" fill="url(#dn-body)" />
      <path d="M60 26 q10 4 8 16 q-8 -4 -16 0 q0 -12 8 -16Z" fill="url(#dn-body)" />
      {[46, 54, 62].map((x) => (
        <path key={x} d={`M${x} 30 l4 -7 l4 7Z`} fill="#e5b44f" />
      ))}
      <ellipse cx="60" cy="88" rx="18" ry="12" fill="#dff0c8" opacity=".55" />
      <Eyes y={54} dx={9} r={5} />
      <Cheeks y={64} dx={19} fill="#f2a37e" />
      <Smile y={68} cheer={cheer} />
    </g>
  );
}

/* ---- Xe đua (Đường đua) ---- */
function RaceCar({ cheer }: { cheer: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="rc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9a8f" />
          <stop offset="55%" stopColor="#ef6758" />
          <stop offset="100%" stopColor="#c1443a" />
        </linearGradient>
      </defs>
      <Shadow />
      <g className="bd-spin bd-fast" style={{ transformOrigin: "40px 104px" }}>
        <circle cx="40" cy="104" r="12" fill="#3b3a5a" />
        <circle cx="40" cy="104" r="4.5" fill="#c9c8e0" />
        <rect x="38.5" y="93" width="3" height="22" rx="1.5" fill="#c9c8e0" opacity=".5" />
      </g>
      <g className="bd-spin bd-fast" style={{ transformOrigin: "82px 104px" }}>
        <circle cx="82" cy="104" r="12" fill="#3b3a5a" />
        <circle cx="82" cy="104" r="4.5" fill="#c9c8e0" />
        <rect x="80.5" y="93" width="3" height="22" rx="1.5" fill="#c9c8e0" opacity=".5" />
      </g>
      <path d="M26 100 q4 -18 20 -20 l6 -12 q10 -6 20 0 l4 12 q16 4 20 20 q-45 8 -90 0Z" fill="url(#rc-body)" />
      <path d="M52 66 q8 -4 16 0 l3 12 q-11 -4 -22 0Z" fill="#bfe0ff" />
      <rect x="30" y="94" width="60" height="7" rx="3.5" fill="#ffb44f" />
      <Eyes y={86} dx={9} r={4.6} />
      <Smile y={95} cheer={cheer} />
    </g>
  );
}

/* ---- Công chúa (Vương quốc) ---- */
function Princess({ cheer }: { cheer: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="pr-dress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffa9d0" />
          <stop offset="100%" stopColor="#e264a0" />
        </linearGradient>
        <radialGradient id="pr-face" cx="45%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#ffe6d0" />
          <stop offset="100%" stopColor="#ffcfae" />
        </radialGradient>
      </defs>
      <Shadow />
      <path d="M60 66 q26 8 30 52 q-30 8 -60 0 q4 -44 30 -52Z" fill="url(#pr-dress)" />
      <path d="M40 92 q20 6 40 0" fill="none" stroke="#c9a7f5" strokeWidth="4" strokeLinecap="round" />
      <path d="M38 48 q-6 24 2 34 q8 -6 20 -6 q12 0 20 6 q8 -10 2 -34Z" fill="#6b4a2c" />
      <circle cx="60" cy="50" r="20" fill="url(#pr-face)" />
      <path d="M40 46 q20 -12 40 0 l-4 -10 q-16 -8 -32 0Z" fill="#6b4a2c" />
      <path d="M44 34 l6 8 l6 -10 l6 10 l6 -8 l-2 10 q-11 -5 -22 0Z" fill="#ffd858" stroke="#f0b429" strokeWidth="1.5" />
      {[46, 60, 74].map((x) => <circle key={x} cx={x} cy="35" r="2.2" fill="#67d3ff" />)}
      <Eyes y={50} dx={7} r={4} />
      <Cheeks y={58} dx={14} fill="#ff9ec4" />
      <Smile y={60} cheer={cheer} />
    </g>
  );
}

/* ---- Robot (Thành phố Robot) ---- */
function Robot({ cheer }: { cheer: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="rb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe4f5" />
          <stop offset="100%" stopColor="#7db9dd" />
        </linearGradient>
      </defs>
      <Shadow />
      <line x1="60" y1="30" x2="60" y2="20" stroke="#9fd6e8" strokeWidth="3" />
      <circle className="bd-flicker" style={{ transformOrigin: "60px 18px" }} cx="60" cy="18" r="4.5" fill="#ffd858" />
      <rect x="34" y="32" width="52" height="46" rx="14" fill="url(#rb-body)" />
      <rect x="40" y="42" width="40" height="26" rx="9" fill="#2d4a63" />
      <Eyes y={55} dx={9} r={4.6} />
      <rect x="42" y="82" width="36" height="24" rx="10" fill="#5aa9e6" />
      {[46, 60, 74].map((x) => <circle key={x} cx={x} cy="94" r="3" fill="#bfe4f5" />)}
      <circle cx="30" cy="52" r="7" fill="#9fd6e8" />
      <circle cx="90" cy="52" r="7" fill="#9fd6e8" />
      <g style={{ transform: "translateY(0)" }}>
        <path d={`M50 ${58} q10 ${cheer ? 8 : 5} 20 0`} fill="none" stroke="#67d3ff" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ---- Thỏ (Vườn cà rốt) — đủ đầu, thân, 2 tay, 2 chân bước xen kẽ ---- */
function Bunny({ cheer }: { cheer: boolean }) {
  return (
    <g>
      <defs>
        <radialGradient id="bn-body" cx="45%" cy="30%" r="74%">
          <stop offset="0%" stopColor="#ffe3f0" />
          <stop offset="100%" stopColor="#f6b6d3" />
        </radialGradient>
      </defs>
      <Shadow />
      {/* Tai (ve vẩy) */}
      <path className="bd-sway bd-sway-a" style={{ transformOrigin: "50px 36px" }}
        d="M50 36 q-8 -30 0 -34 q10 4 6 34Z" fill="url(#bn-body)" />
      <path className="bd-sway bd-sway-b" style={{ transformOrigin: "70px 36px" }}
        d="M70 36 q8 -30 0 -34 q-10 4 -6 34Z" fill="url(#bn-body)" />
      <path d="M51 30 q-3 -15 1 -19 q5 3 3 19Z" fill="#ff9ec4" />
      <path d="M69 30 q3 -15 -1 -19 q-5 3 -3 19Z" fill="#ff9ec4" />
      {/* Chân — hai chân đung đưa ngược pha như đang bước */}
      <g className="bd-sway bd-sway-a" style={{ transformOrigin: "52px 96px" }}>
        <rect x="46" y="92" width="12" height="22" rx="6" fill="url(#bn-body)" />
        <ellipse cx="49" cy="115" rx="9" ry="5" fill="#ffd0e2" />
      </g>
      <g className="bd-sway bd-sway-b" style={{ transformOrigin: "68px 96px" }}>
        <rect x="62" y="92" width="12" height="22" rx="6" fill="url(#bn-body)" />
        <ellipse cx="71" cy="115" rx="9" ry="5" fill="#ffd0e2" />
      </g>
      {/* Thân + bụng sáng */}
      <ellipse cx="60" cy="84" rx="22" ry="24" fill="url(#bn-body)" />
      <ellipse cx="60" cy="90" rx="13" ry="15" fill="#fff" opacity=".4" />
      {/* Tay (vẫy nhẹ) */}
      <g className="bd-sway bd-sway-b" style={{ transformOrigin: "40px 74px" }}>
        <ellipse cx="38" cy="83" rx="7" ry="11" fill="url(#bn-body)" />
      </g>
      <g className="bd-sway bd-sway-a" style={{ transformOrigin: "80px 74px" }}>
        <ellipse cx="82" cy="83" rx="7" ry="11" fill="url(#bn-body)" />
      </g>
      {/* Đầu + mặt */}
      <circle cx="60" cy="48" r="20" fill="url(#bn-body)" />
      <ellipse cx="60" cy="40" rx="13" ry="8" fill="#fff" opacity=".35" />
      <Eyes y={48} dx={8} r={4.6} />
      <Cheeks y={56} dx={15} fill="#ff8fb9" />
      <path d="M57 55 q3 3 6 0" fill="none" stroke="#7a2f4a" strokeWidth="2" strokeLinecap="round" />
      <Smile y={58} cheer={cheer} />
    </g>
  );
}

/* ---- Cá mập (Biển Sâu) ---- */
function Shark({ cheer }: { cheer: boolean }) {
  return (
    <g>
      <defs>
        <radialGradient id="sk-body" cx="42%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#8ed3ef" />
          <stop offset="60%" stopColor="#3f8fd2" />
          <stop offset="100%" stopColor="#27618f" />
        </radialGradient>
      </defs>
      <Shadow />
      <path className="bd-sway bd-sway-a" style={{ transformOrigin: "36px 74px" }}
        d="M40 74 q-22 -10 -26 -22 q14 0 22 8 q6 6 10 14Z M40 78 q-22 10 -26 22 q14 0 22 -8 q6 -6 10 -14Z" fill="url(#sk-body)" />
      <path d="M60 46 q-6 -18 4 -24 q6 10 4 24Z" fill="#2c6399" />
      <path d="M62 44 q28 4 28 34 q0 22 -30 24 q-24 -2 -24 -26 q0 -30 26 -32Z" fill="url(#sk-body)" />
      <path d="M40 84 q22 8 44 0 q-4 8 -22 8 q-18 0 -22 -8Z" fill="#fff" />
      {[46, 54, 62, 70, 74].map((x, i) => <path key={x} d={`M${x} 84 l2 6 l2 -6Z`} fill="#fff" stroke="#cfe6f2" strokeWidth=".5" transform={`translate(0 ${i % 2})`} />)}
      <ellipse cx="60" cy="70" rx="18" ry="12" fill="#eaf7fc" opacity=".25" />
      <Eyes y={58} dx={11} r={5.2} />
      <Smile y={78} cheer={cheer} />
    </g>
  );
}

const ART: Record<string, (p: { cheer: boolean }) => ReactElement> = {
  ocean: Octopus,
  space: Rocket,
  sunny: Sun,
  valley: Dino,
  race: RaceCar,
  kingdom: Princess,
  robot: Robot,
  carrot: Bunny,
  deepsea: Shark,
};

export default function BuddyArt({ world, cheering = false }: Props) {
  const Draw = ART[world] ?? Bunny;
  return (
    <svg
      className={`bd-svg ${cheering ? "cheer" : ""}`}
      viewBox="0 0 120 130"
      role="img"
      aria-hidden="true"
    >
      <g className="bd-float" style={{ transformOrigin: "60px 120px" }}>
        <Draw cheer={cheering} />
      </g>
    </svg>
  );
}
