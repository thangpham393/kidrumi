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

  // Các đường dẫn bắt buộc đăng nhập. "Nhiệm vụ" (/tasks) yêu cầu đăng nhập.
  const protectedPaths = ["/tasks"];
  const { pathname } = request.nextUrl;
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
