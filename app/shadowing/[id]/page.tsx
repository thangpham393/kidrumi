"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getVideo, fmtTime, type Video } from "../data";

// Kiểu tối thiểu cho YouTube IFrame API (tránh dùng any).
type YTPlayer = {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement | string,
    opts: {
      videoId: string;
      playerVars?: Record<string, number | string>;
      events?: { onReady?: (e: { target: YTPlayer }) => void };
    }
  ) => YTPlayer;
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const speeds = [0.5, 0.75, 1, 1.25, 1.5];
const sizes = [
  { key: "sm", label: "Nhỏ" },
  { key: "md", label: "Vừa" },
  { key: "lg", label: "Lớn" },
] as const;
type SizeKey = (typeof sizes)[number]["key"];

// Nạp YouTube IFrame API một lần, trả về khi window.YT sẵn sàng.
function loadYT(): Promise<YTNamespace> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  });
}

export default function ShadowingDetailPage() {
  const params = useParams<{ id: string }>();
  const video = useMemo(() => getVideo(params.id), [params.id]);

  if (!video) {
    return (
      <main className="wrap">
        <div className="panel" style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: 48 }}>🔍</div>
          <h3 style={{ fontSize: 24 }}>Không tìm thấy video</h3>
          <p style={{ color: "var(--ink-soft)" }}>Bé quay lại thư viện chọn bài khác nhé!</p>
          <Link href="/shadowing" className="btn" style={{ marginTop: 12 }}>
            ← Về thư viện
          </Link>
        </div>
      </main>
    );
  }

  return <ShadowingPlayer video={video} />;
}

function ShadowingPlayer({ video }: { video: Video }) {
  const playerRef = useRef<YTPlayer | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const segRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [active, setActive] = useState(-1);
  const [ready, setReady] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [size, setSize] = useState<SizeKey>("md");
  const [showExpl, setShowExpl] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  // Khởi tạo trình phát YouTube.
  useEffect(() => {
    let cancelled = false;
    loadYT().then((YT) => {
      if (cancelled || !mountRef.current) return;
      playerRef.current = new YT.Player(mountRef.current, {
        videoId: video.youtubeId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: { onReady: () => setReady(true) },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [video.youtubeId]);

  // Bám thời gian phát → tìm câu đang chạy.
  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const now = p.getCurrentTime();
      let idx = -1;
      for (let i = 0; i < video.segments.length; i++) {
        if (video.segments[i].t <= now + 0.15) idx = i;
        else break;
      }
      setActive((prev) => (prev === idx ? prev : idx));
    }, 200);
    return () => window.clearInterval(id);
  }, [ready, video.segments]);

  // Tự cuộn transcript theo câu đang chạy (chỉ cuộn trong khung, không cuộn cả trang).
  useEffect(() => {
    if (!autoScroll || active < 0) return;
    const el = segRefs.current[active];
    const cont = listRef.current;
    if (el && cont) {
      cont.scrollTo({
        top: el.offsetTop - cont.clientHeight / 2 + el.clientHeight / 2,
        behavior: "smooth",
      });
    }
  }, [active, autoScroll]);

  const changeSpeed = (s: number) => {
    setSpeed(s);
    playerRef.current?.setPlaybackRate(s);
  };

  const seek = (t: number) => {
    playerRef.current?.seekTo(t, true);
    playerRef.current?.playVideo();
  };

  return (
    <main className="wrap sh-page">
      <div className="sh-top">
        <Link href="/shadowing" className="btn-ghost sh-back">
          ← Thư viện
        </Link>
        <h1 className="sh-title">{video.title}</h1>
      </div>

      <div className="sh-controls">
        <div className="sh-ctl">
          <span className="lbl">Tốc độ:</span>
          <select
            className="sh-select"
            value={speed}
            onChange={(e) => changeSpeed(Number(e.target.value))}
          >
            {speeds.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </div>
        <div className="sh-ctl">
          <span className="lbl">Cỡ video:</span>
          {sizes.map((s) => (
            <button
              key={s.key}
              className={`pill sm ${size === s.key ? "on" : ""}`}
              onClick={() => setSize(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`sh-detail size-${size}`}>
        {/* Cột video */}
        <div className="sh-video-col">
          <div className="sh-video">
            <div ref={mountRef} />
          </div>
          <p className="sh-hint">💡 Bấm vào một câu để tua video đến đúng chỗ và xem nghĩa/giải thích.</p>
        </div>

        {/* Cột transcript */}
        <div className="sh-scriptbox">
          <div className="sh-script-head">
            <strong>Transcript ({video.segments.length} câu)</strong>
            <div className="sh-toggles">
              <label className="sh-check">
                <input
                  type="checkbox"
                  checked={showExpl}
                  onChange={(e) => setShowExpl(e.target.checked)}
                />
                Hiện giải thích
              </label>
              <label className="sh-check">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                />
                Tự cuộn theo
              </label>
            </div>
          </div>

          <div className="sh-list" ref={listRef}>
            {video.segments.map((seg, i) => (
              <div
                key={i}
                ref={(el) => {
                  segRefs.current[i] = el;
                }}
                className={`sh-seg ${i === active ? "on" : ""}`}
                onClick={() => seek(seg.t)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    seek(seg.t);
                  }
                }}
              >
                <div className="sh-seg-main">
                  <span className="sh-time">{fmtTime(seg.t)}</span>
                  <span className="sh-text">{seg.text}</span>
                </div>
                {showExpl && (
                  <div className="sh-expl">
                    <p className="sh-tr">
                      <b>Dịch:</b> {seg.tr}
                    </p>
                    {seg.words && seg.words.length > 0 && (
                      <div className="sh-words">
                        <b>Từ/cụm từ:</b>
                        {seg.words.map((w, k) => (
                          <span key={k} className="sh-word">
                            {w.w}
                            {w.ph && <i>{` //${w.ph}//`}</i>} — {w.mean}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
