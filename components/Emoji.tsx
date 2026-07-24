"use client";

import { useState } from "react";

// Hiển thị emoji bằng bộ Microsoft Fluent Emoji 3D (ảnh trong public/emoji),
// để mọi thiết bị (Android/Windows/Mac) đều thấy icon giống nhau, đẹp 3D.
// Không có ảnh tương ứng → rớt về emoji hệ thống (ký tự chữ).

// Mã file: codepoint hệ 16, bỏ FE0F — PHẢI khớp script tải scratchpad/fetch-emoji.js
function slug(emoji: string): string {
  return [...emoji]
    .map((c) => c.codePointAt(0)!.toString(16))
    .filter((h) => h !== "fe0f")
    .join("-");
}

export default function Emoji({
  emoji,
  className,
  alt = "",
}: {
  emoji: string;
  className?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={className} aria-hidden={alt ? undefined : true}>
        {emoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/emoji/${slug(emoji)}.png`}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
