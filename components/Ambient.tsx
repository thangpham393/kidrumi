"use client";

import { useEffect, useRef } from "react";
import type { AmbientKind } from "@/app/tasks/worldThemes";

/* ---------------------------------------------------------------------------
   Lớp hạt nền động cho mỗi thế giới (bong bóng, sao, mây, lá, tia tốc độ,
   lấp lánh). Tạo thẻ <i> bằng JS + Web Animations API, phủ toàn màn, không
   chặn chạm. Tự tắt khi prefers-reduced-motion và giảm số hạt trên mobile.
   Khung tham khảo: mykidspace.online.
--------------------------------------------------------------------------- */

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export default function Ambient({
  kind,
  density = "full",
  color = "#ffffff",
}: {
  kind: AmbientKind;
  density?: "full" | "low";
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    host.innerHTML = "";
    const small = matchMedia("(max-width: 560px)").matches;
    const n = (base: number) => (density === "low" ? Math.max(2, Math.round(base * 0.4)) : base);
    const make = (style: Partial<CSSStyleDeclaration>) => {
      const el = document.createElement("i");
      Object.assign(el.style, { position: "absolute", ...style });
      host.appendChild(el);
      return el;
    };
    const inf = Infinity;

    if (kind === "bubbles") {
      for (let i = 0; i < n(small ? 12 : 20); i++) {
        const s = rnd(8, 34);
        const el = make({
          left: `${rnd(2, 98)}%`, bottom: `-${2 * s}px`,
          width: `${s}px`, height: `${s}px`, borderRadius: "50%",
          border: "2px solid rgba(255,255,255,.5)",
          background: "radial-gradient(circle at 31% 27%, rgba(255,255,255,.9) 0 8%, transparent 10%)",
        });
        const dur = rnd(8000, 18000);
        el.animate(
          [
            { transform: "translate(0, 8vh) scale(.6)", opacity: 0 },
            { opacity: 0.65, offset: 0.1 },
            { transform: `translate(${rnd(-40, 40)}px, -55vh) scale(.9)`, opacity: 0.5, offset: 0.5 },
            { transform: `translate(${rnd(-60, 60)}px, -115vh) scale(1.1)`, opacity: 0 },
          ],
          { duration: dur, iterations: inf, delay: -rnd(0, dur) }
        );
      }
    } else if (kind === "clouds") {
      for (let i = 0; i < n(small ? 5 : 8); i++) {
        const el = make({
          left: "-200px", top: `${rnd(5, 65)}%`,
          width: "120px", height: "38px", borderRadius: "999px",
          background: "rgba(255,255,255,.85)", opacity: `${rnd(0.5, 0.85)}`,
          transform: `scale(${rnd(0.6, 1.4)})`,
          boxShadow: "40px -14px 0 -4px rgba(255,255,255,.85), -34px -10px 0 -6px rgba(255,255,255,.85)",
        });
        const dur = rnd(20000, 40000);
        el.animate([{ left: "-200px" }, { left: "calc(100vw + 200px)" }], { duration: dur, iterations: inf, delay: -rnd(0, dur) });
      }
    } else if (kind === "stars") {
      for (let i = 0; i < n(small ? 6 : 10); i++) {
        const el = make({
          left: `${rnd(2, 78)}%`, top: `${rnd(3, 60)}%`,
          width: "6px", height: "6px", borderRadius: "50%",
          background: "#fff8bd",
          boxShadow: "0 0 10px #fff5a2, -40px -14px 0 -2px rgba(255,255,255,.35)",
          opacity: "0",
        });
        const dur = rnd(5000, 11000);
        el.animate(
          [
            { transform: "translate(0,0)", opacity: 0, offset: 0 },
            { opacity: 0, offset: 0.42 },
            { opacity: 1, offset: 0.47 },
            { transform: "translate(190px, 98px)", opacity: 0, offset: 0.7 },
            { transform: "translate(190px, 98px)", opacity: 0, offset: 1 },
          ],
          { duration: dur, iterations: inf, delay: -rnd(0, dur) }
        );
      }
    } else if (kind === "leaves") {
      for (let i = 0; i < n(small ? 10 : 16); i++) {
        const s = rnd(12, 28);
        const el = make({
          left: `${rnd(2, 98)}%`, top: "-32px",
          width: `${s}px`, height: `${0.58 * s}px`, borderRadius: "100% 0 100% 0",
          background: "linear-gradient(145deg, #b9db52, #4ca66a)", opacity: "0",
        });
        const dur = rnd(9000, 18000);
        const drift = rnd(-120, 120);
        el.animate(
          [
            { transform: "translate(0,-30px) rotate(0deg)", opacity: 0 },
            { opacity: 0.7, offset: 0.12 },
            { transform: `translate(${drift}px, 52vh) rotate(220deg)`, offset: 0.5 },
            { transform: "translate(0, 112vh) rotate(480deg)", opacity: 0 },
          ],
          { duration: dur, iterations: inf, delay: -rnd(0, dur) }
        );
      }
    } else if (kind === "speed") {
      for (let i = 0; i < n(small ? 8 : 14); i++) {
        const el = make({
          left: "-180px", top: `${rnd(15, 85)}%`,
          width: `${rnd(70, 200)}px`, height: "4px", borderRadius: "99px",
          background: `linear-gradient(90deg, transparent, ${color}, rgba(255,255,255,.2))`,
          opacity: "0.85",
        });
        const dur = rnd(3500, 8000);
        el.animate([{ transform: "translateX(0)" }, { transform: "translateX(calc(100vw + 400px))" }], { duration: dur, iterations: inf, delay: -rnd(0, dur) });
      }
    } else {
      // sparkles
      for (let i = 0; i < n(small ? 8 : 14); i++) {
        const el = make({
          left: `${rnd(3, 95)}%`, top: `${rnd(5, 80)}%`,
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#fff8c4",
          boxShadow: "0 0 0 4px rgba(255,248,196,.15), 0 0 16px #fff8bb",
          transform: `scale(${rnd(0.4, 1)})`,
        });
        const dur = rnd(2000, 4200);
        el.animate(
          [
            { opacity: 1, transform: "scale(1)" },
            { opacity: 0.4, transform: "scale(.65) rotate(20deg)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          { duration: dur, iterations: inf, delay: -rnd(0, dur) }
        );
      }
    }

    return () => {
      host.innerHTML = "";
    };
  }, [kind, density, color]);

  return <div ref={ref} aria-hidden="true" className="ambient-layer" />;
}
