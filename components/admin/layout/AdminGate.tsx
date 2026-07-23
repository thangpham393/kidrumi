import Link from "next/link";
import type { Gate } from "@/lib/admin/auth";
import styles from "./AdminGate.module.css";

// Màn chặn khi người dùng không đủ quyền vào /admin. Server component.
export default function AdminGate({ gate }: { gate: Extract<Gate, { ok: false }> }) {
  if (gate.code === "no_admin_config") {
    return (
      <Screen emoji="🛠️" title="Chưa cấu hình quản trị">
        <p className={styles.text}>
          Thêm danh sách email admin vào <code>.env.local</code> rồi khởi động lại server:
        </p>
        <pre className={styles.code}>{`ADMIN_EMAILS=ban@example.com`}</pre>
      </Screen>
    );
  }

  if (gate.code === "forbidden") {
    return (
      <Screen emoji="🚫" title="Không có quyền truy cập">
        <p className={styles.text}>
          Bạn đang đăng nhập bằng <b>{gate.email}</b> — tài khoản này không nằm trong danh sách admin.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.btnGhost}>Về trang chính</Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className={styles.btn}>Đăng xuất & đổi tài khoản</button>
          </form>
        </div>
      </Screen>
    );
  }

  // unauthenticated (hoặc lỗi khác)
  return (
    <Screen emoji="🔐" title="Cần đăng nhập">
      <p className={styles.text}>Đăng nhập bằng tài khoản admin để vào khu quản trị.</p>
      <div className={styles.actions}>
        <Link href="/login" className={styles.btn}>Đăng nhập</Link>
      </div>
    </Screen>
  );
}

function Screen({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.mark} aria-hidden="true">K</div>
        <div className={styles.art} aria-hidden="true">{emoji}</div>
        <h1 className={styles.title}>{title}</h1>
        {children}
      </div>
    </div>
  );
}
