import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Đăng xuất: xóa session Supabase rồi quay về trang chủ.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
