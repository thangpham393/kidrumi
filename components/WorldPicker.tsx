"use client";

import { useEffect, useRef, useState } from "react";
import { themeAsset } from "@/app/tasks/worldThemes";

/* ---------------------------------------------------------------------------
   Nút avatar thế giới + popover chọn thế giới (lưới 9 ô).
   Bấm avatar (mascot của thế giới đang chọn) → hiện lưới thẻ có thumbnail nền
   thật; bấm 1 ô là đổi theme ngay. Đóng khi bấm ra ngoài / Esc.
   Ý tưởng khung: mykidspace.online.
--------------------------------------------------------------------------- */

type World = { key: string; label: string; emoji: string };

export default function WorldPicker({
  worlds,
  current,
  onPick,
}: {
  worlds: World[];
  current: string;
  onPick: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const active = worlds.find((w) => w.key === current) ?? worlds[0];

  // Đóng khi bấm ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="world-picker" ref={boxRef}>
      <button
        type="button"
        className="world-avatar"
        style={{ backgroundImage: `url(${themeAsset(active.key, "bg")})` }}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Thế giới: ${active.label}. Bấm để đổi`}
        title="Đổi thế giới"
      >
        <span className="world-avatar-emoji">{active.emoji}</span>
      </button>

      {open && (
        <div className="world-menu" role="menu" aria-label="Chọn thế giới">
          {worlds.map((w) => (
            <button
              key={w.key}
              type="button"
              role="menuitemradio"
              aria-checked={w.key === current}
              className={`world-card ${w.key === current ? "on" : ""}`}
              onClick={() => {
                onPick(w.key);
                setOpen(false);
              }}
            >
              <span
                className="world-thumb"
                style={{ backgroundImage: `url(${themeAsset(w.key, "bg")})` }}
              >
                <span className="world-thumb-emoji">{w.emoji}</span>
                {w.key === current && <span className="world-check" aria-hidden="true">✓</span>}
              </span>
              <span className="world-card-label">{w.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
