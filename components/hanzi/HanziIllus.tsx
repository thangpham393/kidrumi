"use client";

import { useState } from "react";
import Emoji from "@/components/Emoji";

// Ảnh minh hoạ clay 3D cho một chữ. Ưu tiên ảnh trong public/illustrations/hanzi/;
// chưa có ảnh (hoặc tải lỗi) → rớt về emoji để không vỡ layout.
export default function HanziIllus({
  src,
  emoji,
  alt = "",
  className,
}: {
  src?: string;
  emoji: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <Emoji emoji={emoji} className={className} alt={alt} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
