"use client";

import LessonRunner from "@/components/listen/LessonRunner";
import { ROADMAP, PROMPTS, LANG, VARIANT, BASE_PATH } from "../lessons";

export default function EnglishLessonPage() {
  return (
    <LessonRunner
      lang={LANG}
      roadmap={ROADMAP}
      prompts={PROMPTS}
      variant={VARIANT}
      basePath={BASE_PATH}
    />
  );
}
