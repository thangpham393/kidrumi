"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useChild } from "@/components/ChildContext";
import ListenLesson from "./ListenLesson";
import type { Roadmap } from "./roadmap";
import { useListenProgress } from "./progress";

type Props = {
  lang: string;
  roadmap: Roadmap;
  prompts: ((term: string) => string)[];
  variant?: string;
  basePath: string; // vd "/english/listen"
};

// Chạy một chặng theo id trên URL. Tự tìm chặng, chốt mở khoá tuyến tính,
// đánh dấu hoàn thành và trỏ sang chặng kế tiếp.
export default function LessonRunner({
  lang,
  roadmap,
  prompts,
  variant,
  basePath,
}: Props) {
  const { lesson: id } = useParams<{ lesson: string }>();
  const { child } = useChild();
  const childId = child?.id ?? null;
  const { done, ready, markDone } = useListenProgress(lang, childId);

  const idx = roadmap.lessons.findIndex((l) => l.id === id);
  const lesson = idx >= 0 ? roadmap.lessons[idx] : undefined;

  // Chưa nạp xong tiến độ → chờ (tránh chớp "chưa mở").
  if (!ready) return <main className="wrap rm-msg" aria-busy="true" />;

  if (!lesson) {
    return (
      <main className="wrap rm-msg">
        <div className="panel rm-msg-card">
          <div className="rm-msg-emoji" aria-hidden>
            🤔
          </div>
          <h2>Không tìm thấy chặng này</h2>
          <Link href={basePath} className="btn">
            Về lộ trình
          </Link>
        </div>
      </main>
    );
  }

  const unlocked = idx === 0 || done.has(roadmap.lessons[idx - 1].id);
  if (!unlocked) {
    return (
      <main className="wrap rm-msg">
        <div className="panel rm-msg-card">
          <div className="rm-msg-emoji" aria-hidden>
            🔒
          </div>
          <h2>Chặng này chưa mở</h2>
          <p>Bé hãy hoàn thành chặng trước để mở chặng này nhé!</p>
          <Link href={basePath} className="btn">
            Về lộ trình
          </Link>
        </div>
      </main>
    );
  }

  const nextLesson = roadmap.lessons[idx + 1];
  const nextHref = nextLesson ? `${basePath}/${nextLesson.id}` : undefined;

  return (
    <ListenLesson
      key={lesson.id}
      words={lesson.words}
      distractors={lesson.distractors}
      prompts={prompts}
      choices={lesson.choices}
      total={lesson.total}
      showLabel={lesson.showLabel}
      lang={lang}
      variant={variant}
      topicLabel={lesson.topicLabel}
      stage={lesson.stage}
      icon={lesson.icon}
      backHref={basePath}
      nextHref={nextHref}
      onDone={() => markDone(lesson.id)}
    />
  );
}
