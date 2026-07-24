import { NextResponse } from "next/server";
import { getLibrary } from "@/lib/admin/library";

// Chỉ đọc — trả về danh sách rút gọn + thống kê thư viện Shadowing.
// An toàn ở mọi môi trường (video vốn đã công khai ở trang /shadowing).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { videos, stats } = getLibrary();
  // Nhập/xoá dùng fs + child_process (mlx_whisper) → chỉ chạy máy cục bộ.
  const editable = process.env.NODE_ENV !== "production";
  return NextResponse.json({ videos, stats, editable });
}
