"use client";

import Link from "next/link";
import Image from "next/image";
import { useChild } from "@/components/ChildContext";
import { useAuth } from "@/components/AuthContext";
import { CHAPTERS, STORY_ORDER, storyById } from "./data";
import { nextIndex, useStoryDone } from "./progress";

// "Story in Order" — BẢN ĐỒ HỌC theo chương (bản tiếng Anh của "Nghe hiểu câu chuyện").
// 20 truyện chia 6 chương, nối tiếp nhau bằng đường chấm. Truyện đã xong có dấu ✓; truyện
// kế tiếp được tô nổi; các truyện xa hơn tạm khoá 🔒. Bấm một truyện đã mở → sang màn chơi
// (/english/story/<id>). Tiến độ lưu riêng cho tiếng Anh (kind="en_story").

type NodeState = "done" | "current" | "locked";

export default function StoryMapPage() {
  const { child } = useChild();
  const { user } = useAuth();
  // Đăng nhập + hồ sơ bé thật → đồng bộ Supabase (chung nguồn với Nhiệm vụ); khách → local.
  const canSync = !!user && !!child && child.id !== "local";
  // done = null ở render đầu (SSR + client-first) → coi như [] để KHỚP, tránh lệch
  // hydration; hook nạp tiến độ thật (Supabase ∪ local) rồi vẽ lại.
  const { done } = useStoryDone(child?.id ?? null, canSync);

  const doneList = done ?? [];
  const doneSet = new Set(doneList);
  const nIdx = nextIndex(doneList);
  const total = STORY_ORDER.length;
  const doneCount = doneList.filter((id) => STORY_ORDER.includes(id)).length;
  const pct = Math.round((doneCount / total) * 100);
  const nextStory = nIdx < total ? storyById(STORY_ORDER[nIdx]) : null;

  const stateOf = (id: string): NodeState => {
    if (doneSet.has(id)) return "done";
    return STORY_ORDER.indexOf(id) === nIdx ? "current" : "locked";
  };

  return (
    <main className="wrap smap-wrap">
      <div className="smap-top">
        <Link href="/english" className="pill">
          ← Góc Tiếng Anh
        </Link>

        <div className="smap-progress" aria-label={`Tiến độ ${doneCount} trên ${total} truyện`}>
          <div className="smap-prog-head">
            <span className="smap-prog-lbl">Tiến độ</span>
            <span className="smap-prog-count">
              <span aria-hidden>⭐</span> {doneCount}/{total}
            </span>
          </div>
          <div className="smap-bar">
            <span className="smap-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          {nextStory ? (
            <div className="smap-next">
              <span className="smap-next-lbl">TRUYỆN TIẾP THEO</span>
              <strong className="smap-next-title">{nextStory.title}</strong>
            </div>
          ) : (
            <div className="smap-next">
              <strong className="smap-next-title">Bé đã xong hết! 🌟</strong>
            </div>
          )}
        </div>
      </div>

      <p className="page-eyebrow smap-eyebrow">STORY IN ORDER</p>
      <h1 className="page-title smap-title">Bản đồ kể chuyện tiếng Anh 🐰</h1>
      <p className="page-sub smap-sub">
        Nghe tiếng Anh rồi xếp tranh đúng thứ tự để mở truyện tiếp theo nhé!
      </p>

      {CHAPTERS.map((ch, ci) => (
        <section className="smap-chapter" key={ch.id}>
          <div className="smap-banner">
            <span className="smap-banner-tag">CHƯƠNG {ci + 1}</span>
            <span className="smap-banner-title">{ch.title}</span>
          </div>

          <ol className="smap-path">
            {ch.storyIds.map((id) => {
              const s = storyById(id);
              if (!s) return null;
              const st = stateOf(id);
              const cover = s.frames[0];
              const inner = (
                <>
                  <span className="smap-node">
                    <Image
                      src={cover.img}
                      alt=""
                      fill
                      sizes="120px"
                      className="smap-node-img"
                    />
                    {st === "done" && (
                      <span className="smap-badge done" aria-hidden>
                        ✓
                      </span>
                    )}
                    {st === "locked" && (
                      <span className="smap-lock" aria-hidden>
                        🔒
                      </span>
                    )}
                  </span>
                  <span className="smap-label">{s.title}</span>
                </>
              );
              return (
                <li key={id} className={`smap-item ${st}`}>
                  {st === "locked" ? (
                    <div
                      className="smap-cell"
                      aria-disabled="true"
                      aria-label={`${s.title} — chưa mở`}
                    >
                      {inner}
                    </div>
                  ) : (
                    <Link
                      href={`/english/story/${id}`}
                      className="smap-cell"
                      aria-label={`Chơi truyện ${s.title}${st === "done" ? " (đã xong)" : ""}`}
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <span className="smap-mascot" aria-hidden>
        🐰
      </span>
    </main>
  );
}
