"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Baby, Star, RefreshCw, Eye, LogIn } from "lucide-react";
import {
  PageHeader,
  Panel,
  Button,
  Badge,
  StatCard,
  DataTable,
  TableToolbar,
  Pagination,
  Drawer,
  EmptyState,
  type Column,
} from "@/components/admin";
import styles from "./users.module.css";

type Kid = { id: string; name: string; world: string; stars: number };
type AdminUser = {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  childrenCount: number;
  stars: number;
  children: Kid[];
};
type Stats = { totalUsers: number; totalChildren: number; totalStars: number };

const PAGE_SIZE = 12;

function initials(name?: string | null) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}
function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(s));
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<{ code: string; message: string } | null>(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminUser | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/users");
      const d = await r.json();
      if (!r.ok || d.error) setErr({ code: d.code ?? "error", message: d.error ?? "Không tải được." });
      else {
        setUsers(d.users ?? []);
        setStats(d.stats ?? null);
      }
    } catch {
      setErr({ code: "network", message: "Không gọi được máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => (u.email ?? "").toLowerCase().includes(q) || u.name.toLowerCase().includes(q),
    );
  }, [users, query]);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cols: Column<AdminUser>[] = [
    {
      key: "user",
      header: "Người dùng",
      render: (u) => (
        <div className={styles.user}>
          {u.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.avatarImg} src={u.avatar} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className={styles.avatar} aria-hidden="true">{initials(u.name)}</span>
          )}
          <div className={styles.userMeta}>
            <span className={styles.userName}>{u.name}</span>
            <span className={styles.userEmail}>{u.email ?? "—"}</span>
          </div>
        </div>
      ),
    },
    { key: "children", header: "Số bé", align: "right", render: (u) => <span className="admin-num">{u.childrenCount}</span> },
    { key: "stars", header: "Sao", align: "right", render: (u) => <span className="admin-num">{u.stars.toLocaleString("vi-VN")}</span> },
    { key: "created", header: "Tạo lúc", align: "right", render: (u) => <span className="admin-num">{fmtDate(u.createdAt)}</span> },
    { key: "last", header: "Đăng nhập gần nhất", align: "right", render: (u) => <span className="admin-num">{fmtDate(u.lastSignInAt)}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (u) => (
        <Button size="sm" variant="ghost" leadingIcon={Eye} onClick={() => setDetail(u)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  // ----- Trạng thái cấu hình / quyền -----
  const configHint = (() => {
    if (!err) return null;
    if (err.code === "no_service_key" || err.code === "no_admin_config") {
      return (
        <Panel title="Cần cấu hình để bật quản lý người dùng">
          <div className={styles.setup}>
            <p className={styles.setupText}>
              Tính năng này đọc dữ liệu của <b>mọi người dùng</b> nên cần khoá service role (chỉ chạy ở server)
              và danh sách email admin. Thêm vào <code>.env.local</code> rồi khởi động lại server:
            </p>
            <pre className={styles.code}>
{`# Supabase → Project Settings → API → service_role (secret)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Email được phép vào trang quản trị (phân tách bằng dấu phẩy)
ADMIN_EMAILS=ban@example.com`}
            </pre>
            <p className={styles.setupNote}>
              ⚠️ Service role bỏ qua RLS — tuyệt đối không đặt vào biến <code>NEXT_PUBLIC_</code> và không commit lên git.
            </p>
            <Button variant="secondary" leadingIcon={RefreshCw} onClick={load}>Kiểm tra lại</Button>
          </div>
        </Panel>
      );
    }
    if (err.code === "unauthenticated") {
      return (
        <Panel title="Cần đăng nhập">
          <EmptyState
            emoji="🔐"
            title="Bạn chưa đăng nhập"
            description="Đăng nhập bằng tài khoản admin để xem danh sách người dùng."
            action={<Button leadingIcon={LogIn} onClick={() => (window.location.href = "/login")}>Đăng nhập</Button>}
          />
        </Panel>
      );
    }
    if (err.code === "forbidden") {
      return (
        <Panel title="Không có quyền">
          <EmptyState emoji="🚫" title="Tài khoản không phải admin" description={err.message} />
        </Panel>
      );
    }
    return (
      <Panel title="Lỗi">
        <EmptyState emoji="🙈" title="Không tải được" description={err.message}
          action={<Button variant="secondary" leadingIcon={RefreshCw} onClick={load}>Thử lại</Button>} />
      </Panel>
    );
  })();

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Người dùng"
        description="Danh sách phụ huynh và hồ sơ bé — dữ liệu thật từ Supabase."
        actions={
          <Button variant="secondary" leadingIcon={RefreshCw} onClick={load} isLoading={loading}>
            Tải lại
          </Button>
        }
      />

      {err ? (
        configHint
      ) : (
        <>
          <div className={styles.statGrid}>
            <StatCard label="Người dùng" value={(stats?.totalUsers ?? 0).toLocaleString("vi-VN")} icon={Users} />
            <StatCard label="Hồ sơ bé" value={(stats?.totalChildren ?? 0).toLocaleString("vi-VN")} icon={Baby} />
            <StatCard label="Tổng sao" value={(stats?.totalStars ?? 0).toLocaleString("vi-VN")} icon={Star} />
          </div>

          <Panel title="Tất cả người dùng" subtitle={`${filtered.length} tài khoản`} bodyClassName="admin-panel-flush">
            <TableToolbar
              searchValue={query}
              onSearchChange={(v) => {
                setQuery(v);
                setPage(1);
              }}
              searchPlaceholder="Tìm theo email hoặc tên…"
            />
            <DataTable
              columns={cols}
              rows={paged}
              getRowId={(u) => u.id}
              loading={loading}
              emptyState={
                <EmptyState emoji="👤" title={query ? "Không tìm thấy" : "Chưa có người dùng"}
                  description={query ? "Thử từ khoá khác." : "Chưa có tài khoản nào đăng ký."} />
              }
            />
            {filtered.length > PAGE_SIZE && (
              <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
            )}
          </Panel>
        </>
      )}

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name ?? "Người dùng"}
        description={detail?.email ?? undefined}
      >
        {detail && (
          <div className={styles.detail}>
            <div className={styles.detailRow}><span>Ngày tạo</span><b>{fmtDate(detail.createdAt)}</b></div>
            <div className={styles.detailRow}><span>Đăng nhập gần nhất</span><b>{fmtDate(detail.lastSignInAt)}</b></div>
            <div className={styles.detailRow}><span>Tổng sao</span><b className="admin-num">{detail.stars.toLocaleString("vi-VN")} ⭐</b></div>

            <h4 className={styles.detailTitle}>Hồ sơ bé ({detail.childrenCount})</h4>
            {detail.children.length === 0 ? (
              <p className={styles.detailEmpty}>Tài khoản này chưa tạo hồ sơ bé nào.</p>
            ) : (
              <div className={styles.kids}>
                {detail.children.map((k) => (
                  <div key={k.id} className={styles.kid}>
                    <div className={styles.kidMain}>
                      <span className={styles.kidName}>{k.name}</span>
                      <Badge tone="neutral">{k.world}</Badge>
                    </div>
                    <span className={`${styles.kidStars} admin-num`}>{k.stars} ⭐</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
