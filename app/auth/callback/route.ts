import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google chuyển hướng người dùng về đây kèm mã "code".
// Ta đổi code lấy session (cookie) rồi đưa người dùng về trang đích.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // "next" cho biết sau khi đăng nhập xong quay lại trang nào.
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Xử lý load balancer / môi trường có header x-forwarded-host.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Có lỗi -> đưa về trang login kèm thông báo.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
