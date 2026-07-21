"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/useToast";

type Level = "de" | "mid" | "hard";
type Video = {
  id: number;
  title: string;
  source: string;
  level: Level;
  dur: string;
  emoji: string;
};

const levelLabel: Record<Level, string> = {
  de: "Dễ",
  mid: "Trung bình",
  hard: "Khó",
};
const levelCls: Record<Level, string> = { de: "", mid: "mid", hard: "hard" };

const sources = ["Tất cả", "Bluey", "Early Learning", "Little Fox", "The Fable Cottage", "Vooks"];

const videos: Video[] = [
  { id: 1, title: "Feelings and Emotions | Stories for Kindergarten", source: "Little Fox", level: "de", dur: "7:17", emoji: "😴" },
  { id: 2, title: "Learn Shapes and Colors | Basic Concepts", source: "Little Fox", level: "de", dur: "12:00", emoji: "🚗" },
  { id: 3, title: "Four Seasons of the Year | Stories for Kids", source: "Little Fox", level: "mid", dur: "10:19", emoji: "🏖️" },
  { id: 4, title: "Share with Friends | Early Learning", source: "Little Fox", level: "de", dur: "1:51", emoji: "🎮" },
  { id: 5, title: "I Can Do It! | Stories for Kindergarten", source: "Little Fox", level: "de", dur: "16:44", emoji: "🏊" },
  { id: 6, title: "Buses, Bumper Cars, Fast Cars + More", source: "Little Fox", level: "mid", dur: "7:51", emoji: "🚌" },
  { id: 7, title: "First Day of School | Back to School", source: "Little Fox", level: "mid", dur: "1:59", emoji: "🎒" },
  { id: 8, title: '"What is your name?" and "What Is This?"', source: "Little Fox", level: "de", dur: "8:16", emoji: "🐱" },
  { id: 9, title: "I See | Phonics | Bedtime Stories", source: "Little Fox", level: "de", dur: "1:22", emoji: "👀" },
  { id: 10, title: "Teddy's Day | Phonics | Bedtime Stories", source: "Little Fox", level: "de", dur: "1:07", emoji: "🧸" },
  { id: 11, title: "Dinosaurs | Phonics | Bedtime Stories", source: "Little Fox", level: "de", dur: "1:20", emoji: "🦕" },
  { id: 12, title: "Things That Fly | Phonics | Bedtime Stories", source: "Little Fox", level: "de", dur: "2:07", emoji: "🎈" },
  { id: 13, title: "Tickling the giant mountain! | Blue Mountains", source: "Bluey", level: "mid", dur: "1:42", emoji: "⛰️" },
  { id: 14, title: "Sharing is Caring | Magic Xylophone", source: "Bluey", level: "hard", dur: "2:14", emoji: "🎹" },
  { id: 15, title: "Watch out for the Magic Asparagus", source: "Bluey", level: "mid", dur: "2:00", emoji: "🥦" },
  { id: 16, title: "Doctor Bluey and Nurse Bingo | Hospital", source: "Bluey", level: "hard", dur: "2:13", emoji: "🏥" },
  { id: 17, title: "The Gingerbread Man | Fairy Tales", source: "The Fable Cottage", level: "mid", dur: "5:40", emoji: "🍪" },
  { id: 18, title: "The Three Little Pigs | Fairy Tales", source: "The Fable Cottage", level: "mid", dur: "6:12", emoji: "🐷" },
  { id: 19, title: "Goodnight Moon | Read Aloud", source: "Vooks", level: "de", dur: "3:30", emoji: "🌙" },
  { id: 20, title: "Pete the Cat | I Love My White Shoes", source: "Vooks", level: "de", dur: "4:05", emoji: "👟" },
];

export default function ShadowingPage() {
  const { showToast, toastEl } = useToast();
  const [tab, setTab] = useState<"library" | "learning">("library");
  const [source, setSource] = useState("Tất cả");
  const [level, setLevel] = useState<"all" | Level>("all");

  const list = useMemo(() => {
    return videos.filter(
      (v) =>
        (source === "Tất cả" || v.source === source) &&
        (level === "all" || v.level === level)
    );
  }, [source, level]);

  return (
    <main className="wrap">
      <div className="lib-tabs">
        <button
          className={`t ${tab === "library" ? "on" : ""}`}
          onClick={() => setTab("library")}
        >
          Thư viện
        </button>
        <button
          className={`t ${tab === "learning" ? "on" : ""}`}
          onClick={() => setTab("learning")}
        >
          Đang học
        </button>
      </div>
      <p style={{ color: "var(--ink-soft)" }}>
        Chọn một video để bắt đầu luyện shadowing.
      </p>

      {tab === "library" ? (
        <>
          <div className="filter-row">
            {sources.map((s) => (
              <button
                key={s}
                className={`pill ${source === s ? "on" : ""}`}
                onClick={() => setSource(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <span className="lbl">Độ khó:</span>
            <button
              className={`pill ${level === "all" ? "on" : ""}`}
              onClick={() => setLevel("all")}
            >
              Tất cả
            </button>
            {(["de", "mid", "hard"] as Level[]).map((lv) => (
              <button
                key={lv}
                className={`pill ${level === lv ? "on" : ""}`}
                onClick={() => setLevel(lv)}
              >
                {levelLabel[lv]}
              </button>
            ))}
          </div>

          <div className="vid-grid">
            {list.map((v) => (
              <div
                key={v.id}
                className="vid"
                onClick={() => showToast(`Sắp mở: ${v.title} ▶️`)}
              >
                <div className="thumb">
                  {v.emoji}
                  <span className={`lvl ${levelCls[v.level]}`}>
                    {levelLabel[v.level]}
                  </span>
                  <span className="dur">{v.dur}</span>
                </div>
                <div className="meta">
                  <h4>{v.title}</h4>
                  <div className="badges">
                    <span>{v.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {list.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--ink-soft)", marginTop: 40 }}>
              Chưa có video phù hợp bộ lọc. Thử chọn lại nhé! 🔎
            </p>
          )}
        </>
      ) : (
        <div className="panel" style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: 48 }}>🎧</div>
          <h3 style={{ fontSize: 24 }}>Chưa có bài đang học</h3>
          <p style={{ color: "var(--ink-soft)" }}>
            Bé hãy chọn một video ở Thư viện và bắt đầu luyện, bài học dở dang sẽ
            hiện ở đây để học tiếp.
          </p>
        </div>
      )}
      {toastEl}
    </main>
  );
}
