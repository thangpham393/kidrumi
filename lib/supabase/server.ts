import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client cho phía server (Server Components, Route Handlers, Server Actions).
// Lưu ý Next.js 16: cookies() là hàm async -> phải await.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Được gọi từ Server Component — có thể bỏ qua nếu đã có proxy
            // (proxy.ts) làm mới session.
          }
        },
      },
    },
  );
}
