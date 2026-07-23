import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16: "middleware" đã đổi tên thành "proxy".
// Nhiệm vụ: làm mới (refresh) session Supabase và đồng bộ cookie cho mỗi request.
// Đăng nhập là tùy chọn nên ở đây KHÔNG chặn/redirect người chưa đăng nhập.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Nếu chưa cấu hình env thì bỏ qua, tránh làm hỏng toàn bộ request.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Chạm vào getUser() để token hết hạn được làm mới và cookie được ghi lại.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Khu quản trị (/admin): chỉ email trong ADMIN_EMAILS mới vào được.
  // Nick nào không phải admin (kể cả chưa đăng nhập) → đá về trang chủ.
  // Chỉ áp dụng cho TRANG /admin (không đụng /api/admin — đã gate riêng).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const admins = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const email = user?.email?.toLowerCase();
    const isAdmin = admins.length > 0 && !!email && admins.includes(email);
    // Chỉ khi CHẠY DEV mà chưa cấu hình admin thì cho qua để layout hiện hướng
    // dẫn setup. Trên production luôn chặn: không phải admin → về trang chủ.
    const devSetup = admins.length === 0 && process.env.NODE_ENV !== "production";
    if (!isAdmin && !devSetup) {
      const home = request.nextUrl.clone();
      home.pathname = "/";
      home.search = "";
      return NextResponse.redirect(home);
    }
  }

  // Các đường dẫn bắt buộc đăng nhập. "Nhiệm vụ" (/tasks) yêu cầu đăng nhập.
  const protectedPaths = ["/tasks"];
  const needsAuth = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Chạy trên mọi đường dẫn trừ static files, ảnh và favicon.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
