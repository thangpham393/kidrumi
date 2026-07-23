import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getServiceClient } from "@/lib/supabase/admin";

// Danh sách NGƯỜI DÙNG THẬT (phụ huynh) + tổng hợp hồ sơ bé của họ.
// Gate: phải là admin (requireAdmin) rồi mới dùng service role (bỏ qua RLS).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Kid = { id: string; name: string; world: string; stars: number };

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message, code: gate.code }, { status: gate.status });
  }

  const admin = getServiceClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY trong .env.local.", code: "no_service_key" },
      { status: 503 },
    );
  }

  const { data: list, error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authErr) {
    return NextResponse.json({ error: authErr.message, code: "auth_error" }, { status: 500 });
  }

  const { data: kids } = await admin
    .from("children")
    .select("id, name, world, stars, user_id");

  const byUser = new Map<string, { count: number; stars: number; kids: Kid[] }>();
  for (const c of (kids ?? []) as (Kid & { user_id: string })[]) {
    const e = byUser.get(c.user_id) ?? { count: 0, stars: 0, kids: [] };
    e.count += 1;
    e.stars += c.stars ?? 0;
    e.kids.push({ id: c.id, name: c.name, world: c.world, stars: c.stars ?? 0 });
    byUser.set(c.user_id, e);
  }

  const users = list.users
    .map((u) => {
      const agg = byUser.get(u.id) ?? { count: 0, stars: 0, kids: [] };
      const meta = (u.user_metadata ?? {}) as Record<string, string>;
      return {
        id: u.id,
        email: u.email ?? null,
        name: meta.full_name || meta.name || (u.email ? u.email.split("@")[0] : "—"),
        avatar: meta.avatar_url || meta.picture || null,
        createdAt: u.created_at ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
        childrenCount: agg.count,
        stars: agg.stars,
        children: agg.kids,
      };
    })
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  const stats = {
    totalUsers: users.length,
    totalChildren: (kids ?? []).length,
    totalStars: users.reduce((s, u) => s + u.stars, 0),
  };

  return NextResponse.json({ users, stats });
}
