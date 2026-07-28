"use client";

import Image from "next/image";
import { useState } from "react";

/* Mascot clay cho trang chủ (hero + banner CTA).
   Ảnh thật do người dùng thả vào public/illustrations/. Trước khi có ảnh,
   rớt về emoji 🦕 để layout không vỡ (không hiện ảnh lỗi). */
export default function HomeMascot({
  src,
  alt,
  emoji = "🦕",
  sizes,
  className,
}: {
  src: string;
  alt: string;
  emoji?: string;
  sizes: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="home-mascot-fallback" role="img" aria-label={alt}>
        {emoji}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      // Bỏ tối ưu của Next: ảnh mascot nền trong suốt bị bộ optimizer xuất PNG
      // palette làm hỏng alpha (hiện ô ca-rô). Phục vụ thẳng PNG gốc cho đúng.
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}
