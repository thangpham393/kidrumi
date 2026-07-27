"use client";

import ListenRoadmap from "@/components/listen/ListenRoadmap";
import {
  ROADMAP,
  LANG,
  BASE_PATH,
  BACK_HREF,
  BACK_LABEL,
  EYEBROW,
  TITLE,
} from "./lessons";

export default function ChineseListenPage() {
  return (
    <ListenRoadmap
      lang={LANG}
      roadmap={ROADMAP}
      basePath={BASE_PATH}
      backHref={BACK_HREF}
      backLabel={BACK_LABEL}
      eyebrow={EYEBROW}
      title={TITLE}
    />
  );
}
