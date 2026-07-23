import "server-only";
import { createClient } from "@/lib/supabase/server";

// Danh sách email admin, cấu hình qua env: ADMIN_EMAILS="a@x.com, b@y.com"
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export type Gate =
  | { ok: true; email: string }
  | { ok: false; status: number; code: string; message: string; email?: string };

// Xác thực người gọi là ADMIN trước khi cho dùng service role.
// 1) phải cấu hình ADMIN_EMAILS  2) phải đăng nhập  3) email phải nằm trong allowlist.
export async function requireAdmin(): Promise<Gate> {
  const list = adminEmails();
  if (list.length === 0) {
    return {
      ok: false,
      status: 503,
      code: "no_admin_config",
      message: "Chưa cấu hình ADMIN_EMAILS trong .env.local.",
    };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();

  if (!email) {
    return { ok: false, status: 401, code: "unauthenticated", message: "Bạn cần đăng nhập bằng tài khoản admin." };
  }
  if (!list.includes(email)) {
    return { ok: false, status: 403, code: "forbidden", message: "Tài khoản này không có quyền quản trị.", email };
  }
  return { ok: true, email };
}
