"use client";

import { useEffect, useRef, useState } from "react";
import { getTheme, themeAsset } from "@/app/tasks/worldThemes";

/* ---------------------------------------------------------------------------
   Bạn đồng hành nổi trên nền — nhân vật "sinh động" kéo-thả được.

   • Có đủ ảnh sprite (/themes/<key>/swim1..4 + cheer1..4.webp) → hoạt hình
     flipbook 4 khung: 4 lớp <div> chồng nhau, mỗi lớp một khung, dùng
     @keyframes buddy-frame + animation-delay lệch 1/4 chu kỳ để lật hình.
     Nhịp bơi 880ms, ăn mừng (cheer) 500ms.
   • CHƯA có ảnh → tự rớt về emoji của thế giới, nhún nhẹ (buddy-bob).
   Chỉ cần thả .webp vào public/themes/<key>/ là nâng cấp lên flipbook.

   Vị trí nhân vật lưu localStorage theo tỉ lệ viewport. Tôn trọng
   prefers-reduced-motion (đứng yên khung 1, tắt nhún).
--------------------------------------------------------------------------- */

const POS_KEY = "kidrumi:buddyPos";
const FRAMES = [1, 2, 3, 4];

export default function ThemeBuddy({
  world,
  cheering = false,
}: {
  world: string;
  cheering?: boolean;
}) {
  const theme = getTheme(world);
  const rootRef = useRef<HTMLDivElement>(null);
  // Thế giới đã xác nhận có sprite; hasSprites suy ra để tránh setState đồng bộ.
  const [spriteWorld, setSpriteWorld] = useState<string | null>(null);
  const hasSprites = spriteWorld === world;

  // ---- Thử nạp sprite; có ảnh thì bật flipbook, không thì giữ emoji ----
  useEffect(() => {
    let alive = true;
    const probe = new Image();
    probe.onload = () => {
      if (!alive) return;
      setSpriteWorld(world);
      // Nạp trước các khung còn lại cho mượt.
      for (const m of [...FRAMES.map((f) => `swim${f}`), ...FRAMES.map((f) => `cheer${f}`)]) {
        new Image().src = themeAsset(world, m);
      }
    };
    probe.onerror = () => {
      if (alive) setSpriteWorld((w) => (w === world ? null : w));
    };
    probe.src = themeAsset(world, "swim1");
    return () => {
      alive = false; // dừng cập nhật state sau khi unmount / đổi thế giới
    };
  }, [world]);

  // ---- Vị trí + kéo-thả ----
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const size = () => el.offsetWidth || 110;
    let x = 0.7 * innerWidth;
    let y = 0.66 * innerHeight;
    try {
      const saved = JSON.parse(localStorage.getItem(POS_KEY) ?? "null");
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        x = saved.x * innerWidth;
        y = saved.y * innerHeight;
      }
    } catch {
      localStorage.removeItem(POS_KEY);
    }
    const clamp = () => {
      x = Math.min(Math.max(x, 0), Math.max(0, innerWidth - size()));
      y = Math.min(Math.max(y, 72), Math.max(72, innerHeight - size()));
    };
    const paint = (scale = 1) => {
      el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    };
    clamp();
    paint();

    let drag: { id: number; ox: number; oy: number; sx: number; sy: number; moved: boolean } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const r = el.getBoundingClientRect();
      drag = { id: e.pointerId, ox: e.clientX - r.left, oy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false };
      el.style.cursor = "grabbing";
      try { el.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
      if (!drag.moved) return;
      x = e.clientX - drag.ox;
      y = e.clientY - drag.oy;
      clamp();
      paint(1.06);
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      el.style.cursor = "grab";
      paint(1);
      if (drag.moved) {
        try {
          localStorage.setItem(POS_KEY, JSON.stringify({ x: x / innerWidth, y: y / innerHeight }));
        } catch {}
      }
      drag = null;
    };
    const onResize = () => { clamp(); paint(1); };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      removeEventListener("resize", onResize);
    };
  }, []);

  const mode = cheering ? "cheer" : "swim";
  const cycle = cheering ? 500 : 880;

  return (
    <div
      ref={rootRef}
      className="theme-buddy"
      style={{ cursor: "grab" }}
      title={theme.buddyName}
      aria-label={theme.buddyName}
      role="img"
    >
      {hasSprites ? (
        FRAMES.map((f, i) => (
          <span
            key={f}
            className="buddy-frame-layer"
            style={{
              backgroundImage: `url(${themeAsset(world, `${mode}${f}`)})`,
              animation: `buddy-frame ${cycle}ms steps(1, end) infinite`,
              animationDelay: `${(-((FRAMES.length - i) % FRAMES.length) * cycle) / FRAMES.length}ms`,
              opacity: i === 0 ? 1 : 0,
            }}
          />
        ))
      ) : (
        <span className={`buddy-emoji ${cheering ? "cheer" : ""}`}>{theme.emoji}</span>
      )}
    </div>
  );
}
