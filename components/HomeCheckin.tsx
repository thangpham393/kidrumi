"use client";

import { useEffect, useState } from "react";
import { useChild } from "@/components/ChildContext";

const KEY = "katkid_checkin";

/* Bảng "Điểm danh" trên hero: số sao thật của bé (ChildContext) + chuỗi ngày
   vào học liên tiếp (điểm danh theo ngày, lưu localStorage — không cần backend).
   Streak tính trong useEffect (chỉ chạy ở client) để tránh lệch hydration. */
export default function HomeCheckin() {
  const { child } = useChild();
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    let s = 1;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const prev = JSON.parse(raw) as { date: string; streak: number };
        if (prev.date === iso) {
          s = prev.streak;
        } else {
          const y = new Date(today);
          y.setDate(today.getDate() - 1);
          const yiso = y.toISOString().slice(0, 10);
          s = prev.date === yiso ? prev.streak + 1 : 1;
        }
      }
      localStorage.setItem(KEY, JSON.stringify({ date: iso, streak: s }));
    } catch {
      /* localStorage bị chặn — vẫn hiển thị streak = 1 */
    }
    setStreak(s);
  }, []);

  const stars = child?.stars ?? 0;

  return (
    <div className="hero-checkin">
      <div className="hero-checkin-label">Điểm danh</div>
      <div className="hero-checkin-row">
        <span aria-hidden>⭐</span>
        <strong>{stars}</strong>
      </div>
      <div className="hero-checkin-row">
        <span aria-hidden>🔥</span>
        <strong>{streak ?? "–"}</strong>
        <span className="hc-unit">ngày</span>
      </div>
    </div>
  );
}
