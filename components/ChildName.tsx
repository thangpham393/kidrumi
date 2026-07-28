"use client";

import { useChild } from "@/components/ChildContext";

/* Hiển thị tên bé (từ ChildContext). Trước khi nạp xong / chưa có hồ sơ thì
   dùng fallback. Chờ `ready` để tránh lệch hydration (SSR & client-first-render
   đều ra fallback, rồi mới cập nhật tên thật). */
export default function ChildName({ fallback = "bé" }: { fallback?: string }) {
  const { child, ready } = useChild();
  const name = ready && child?.name ? child.name : fallback;
  return <>{name}</>;
}
