import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client dùng SERVICE ROLE — BỎ QUA RLS, thấy dữ liệu của mọi người dùng.
// TUYỆT ĐỐI chỉ chạy phía server (đã chặn bằng "server-only") và chỉ sau khi
// đã xác thực người gọi là admin (xem lib/admin/auth.ts). Không bao giờ trả key này ra client.

let cached: SupabaseClient | null = null;

export function isServiceConfigured(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
