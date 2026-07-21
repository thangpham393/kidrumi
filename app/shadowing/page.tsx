"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type Lang,
  type Level,
  type Video,
  langLabel,
  levelLabel,
  levelCls,
  levelsByLang,
  sourcesByLang,
  videosByLang,
  defaultLang,
} from "./data";

// Thumbnail: ưu tiên ảnh video thật từ YouTube. Thử hqdefault → mqdefault
// (phòng khi i.ytimg chặn tạm 1 vài request); nếu ID không có ảnh hợp lệ
// (YouTube trả ảnh xám 120px) thì rớt hẳn về emoji trên nền vàng.
const YT_QUALITIES = ["hqdefault", "mqdefault"] as const;

function VidThumb({ v }: { v: Video }) {
  const [imgOk, setImgOk] = useState(false);
  const [qi, setQi] = useState(0); // chỉ số chất lượng đang thử
  const failed = qi >= YT_QUALITIES.length;
  return (
    <div className="thumb">
      {!imgOk && <span className="thumb-emoji">{v.emoji}</span>}
      {!failed && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          key={qi}
          src={`https://i.ytimg.com/vi/${v.youtubeId}/${YT_QUALITIES[qi]}.jpg`}
          alt=""
          className="thumb-photo"
          decoding="async"
          style={{ opacity: imgOk ? 1 : 0 }}
          onLoad={(e) => {
            // Ảnh "không có" của YouTube rộng đúng 120px → thử mức kế tiếp.
            if (e.currentTarget.naturalWidth > 120) setImgOk(true);
            else setQi((i) => i + 1);
          }}
          onError={() => setQi((i) => i + 1)}
        />
      )}
      <span className={`lvl ${levelCls[v.level]}`}>{levelLabel[v.level]}</span>
      <span className="dur">{v.dur}</span>
    </div>
  );
}

export default function ShadowingPage() {
  const [lang, setLang] = useState<Lang>(defaultLang);
  const [tab, setTab] = useState<"library" | "learning">("library");
  const [source, setSource] = useState("Tất cả");
  const [level, setLevel] = useState<"all" | Level>("all");

  const sources = sourcesByLang[lang];
  const levels = levelsByLang[lang];

  const list = useMemo(() => {
    return videosByLang(lang).filter(
      (v) =>
        (source === "Tất cả" || v.source === source) &&
        (level === "all" || v.level === level)
    );
  }, [lang, source, level]);

  // Đổi ngôn ngữ thì reset bộ lọc nguồn (nguồn khác nhau giữa EN/ZH).
  const pickLang = (l: Lang) => {
    setLang(l);
    setSource("Tất cả");
    setLevel("all");
  };

  return (
    <main className="wrap">
      {/* Tab ngôn ngữ — cấp cao nhất */}
      <div className="lang-tabs" role="tablist" aria-label="Ngôn ngữ">
        {(["en", "zh"] as Lang[]).map((l) => (
          <button
            key={l}
            role="tab"
            aria-selected={lang === l}
            className={`lang-tab ${lang === l ? "on" : ""}`}
            onClick={() => pickLang(l)}
          >
            <span className="flag">{l === "en" ? "🇬🇧" : "🇨🇳"}</span>
            {langLabel[l]}
          </button>
        ))}
      </div>

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
            {levels.map((lv) => (
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
              <Link key={v.id} href={`/shadowing/${v.id}`} className="vid">
                <VidThumb v={v} />
                <div className="meta">
                  <h4>{v.title}</h4>
                  <div className="badges">
                    <span>{v.source}</span>
                    <span className="cnt">{v.segments.length} câu</span>
                  </div>
                </div>
              </Link>
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
    </main>
  );
}
