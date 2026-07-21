"use client";

import { useMemo, useState } from "react";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";

const worlds: { key: string; label: string; emoji: string }[] = [
  { key: "ocean", label: "Đại dương", emoji: "🐙" },
  { key: "space", label: "Vũ trụ", emoji: "🚀" },
  { key: "sunny", label: "Vườn nắng", emoji: "☀️" },
  { key: "valley", label: "Thung lũng", emoji: "🦕" },
  { key: "race", label: "Đường đua", emoji: "🏁" },
  { key: "kingdom", label: "Vương quốc", emoji: "👑" },
  { key: "robot", label: "Thành phố Robot", emoji: "🤖" },
  { key: "carrot", label: "Vườn cà rốt", emoji: "🐰" },
  { key: "deepsea", label: "Biển Sâu", emoji: "🐬" },
];

type Task = { id: number; icon: string; name: string; cat: string; stars: number };
const defaultTasks: Task[] = [
  { id: 1, icon: "🪥", name: "Đánh răng thật sạch", cat: "Vệ sinh", stars: 2 },
  { id: 2, icon: "🛏️", name: "Gấp chăn gối gọn gàng", cat: "Việc nhà", stars: 2 },
  { id: 3, icon: "📚", name: "Đọc sách 10 phút", cat: "Học tập", stars: 3 },
  { id: 4, icon: "🥗", name: "Ăn hết phần rau", cat: "Ăn uống", stars: 2 },
  { id: 5, icon: "🧸", name: "Cất đồ chơi đúng chỗ", cat: "Việc nhà", stars: 2 },
];

const todayVi = () => {
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${days[d.getDay()]}, ${dd}/${mm}`;
};

export default function TasksPage() {
  const { child, ready, createChild, addStars } = useChild();
  const { showToast, toastEl } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [world, setWorld] = useState("carrot");
  const [done, setDone] = useState<Record<number, boolean>>({});

  const worldMeta =
    worlds.find((w) => w.key === child?.world) ?? worlds[7];

  const totalTasks = defaultTasks.length;
  const doneCount = useMemo(
    () => Object.values(done).filter(Boolean).length,
    [done]
  );
  const pct = Math.round((doneCount / totalTasks) * 100);

  const toggle = (t: Task) => {
    setDone((prev) => {
      const now = !prev[t.id];
      if (now) {
        addStars(t.stars);
        showToast(`+${t.stars} ⭐ Giỏi lắm ${child?.name ?? "bé"}!`);
      }
      return { ...prev, [t.id]: now };
    });
  };

  const submit = () => {
    createChild(name, world);
    setShowModal(false);
    setName("");
  };

  if (!ready) return <main className="wrap" />;

  // ---- No profile yet: welcome ----
  if (!child) {
    return (
      <main className="wrap">
        <h1 className="page-title" style={{ textAlign: "left", fontSize: 34 }}>
          Đại Dương Nhiệm Vụ
        </h1>
        <p style={{ color: "var(--ink-soft)", fontWeight: 700, marginTop: -4 }}>
          📅 {todayVi()}
        </p>

        <div
          className="panel"
          style={{ maxWidth: 640, margin: "24px auto", textAlign: "center" }}
        >
          <div style={{ fontSize: 54 }}>🐙</div>
          <h2 style={{ fontSize: 30, margin: "10px 0" }}>Chào mừng ba mẹ và bé!</h2>
          <p style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
            Tạo hồ sơ cho bé để bắt đầu: mỗi việc nhỏ hoàn thành là một lần bạn
            đồng hành reo hò, sao tích lũy và rương quà chờ mở cuối ngày.
          </p>
          <button
            className="btn"
            style={{ marginTop: 16 }}
            onClick={() => setShowModal(true)}
          >
            Tạo hồ sơ cho bé 🎉
          </button>
        </div>

        {showModal && (
          <Modal
            name={name}
            setName={setName}
            world={world}
            setWorld={setWorld}
            onClose={() => setShowModal(false)}
            onSubmit={submit}
          />
        )}
        {toastEl}
      </main>
    );
  }

  // ---- Task board ----
  const allDone = doneCount === totalTasks;
  return (
    <main className="wrap">
      <h1 className="page-title" style={{ textAlign: "left", fontSize: 34 }}>
        {worldMeta.label} Nhiệm Vụ
      </h1>
      <p style={{ color: "var(--ink-soft)", fontWeight: 700, marginTop: -4 }}>
        📅 {todayVi()}
      </p>

      <div className="task-hero">
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          {worldMeta.emoji} Đường đến kho báu
        </div>
        <div style={{ opacity: 0.9, fontSize: 14 }}>
          {allDone
            ? "Bé đã hoàn thành mọi nhiệm vụ hôm nay! 🎊"
            : `Còn ${totalTasks - doneCount} việc nữa là mở được rương quà!`}
        </div>
        <div className="bar">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="task-cols">
        <div className="panel">
          <p className="section-label">CHUYẾN PHIÊU LƯU HÔM NAY</p>
          <h3 style={{ marginTop: 0, fontSize: 24 }}>
            Việc nhỏ của <span style={{ color: "var(--pink)" }}>{child.name}</span>
          </h3>

          {defaultTasks.map((t) => (
            <div
              key={t.id}
              className={`task-item ${done[t.id] ? "done" : ""}`}
            >
              <span className="ic">{t.icon}</span>
              <div className="txt">
                <div className="name">{t.name}</div>
                <div className="sub">
                  {t.cat} · +{t.stars} ⭐
                </div>
              </div>
              <button className="check" onClick={() => toggle(t)}>
                {done[t.id] ? "✓" : ""}
              </button>
            </div>
          ))}

          {allDone && (
            <div
              style={{
                background: "var(--amber-soft)",
                borderRadius: 16,
                padding: 20,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              <div style={{ fontSize: 34 }}>🏆</div>
              <div style={{ fontWeight: 800, fontSize: 20, color: "var(--ink)" }}>
                Tuyệt vời quá!
              </div>
              <div style={{ color: "var(--ink-soft)" }}>
                {child.name} đã hoàn thành mọi nhiệm vụ hôm nay.
              </div>
            </div>
          )}
        </div>

        <div className="buddy">
          <p className="section-label">BẠN ĐỒNG HÀNH</p>
          <div style={{ fontSize: 40, textAlign: "center" }}>{worldMeta.emoji}</div>
          <div style={{ fontWeight: 800, textAlign: "center", fontSize: 18 }}>
            Bạn {worldMeta.label}
          </div>
          <div
            style={{
              background: "var(--brand-soft)",
              borderRadius: 14,
              padding: 14,
              margin: "12px 0",
              color: "var(--ink-soft)",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {allDone
              ? "Nhờ có bé mà tớ mạnh khỏe hẳn lên! 🥕"
              : "Cùng nhau hoàn thành nhiệm vụ để tớ lớn nhanh nhé!"}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Năng lượng</div>
          <div className="energy">
            <i style={{ width: `${Math.max(10, pct)}%` }} />
          </div>
          <div
            style={{
              marginTop: 14,
              background: "var(--amber-soft)",
              borderRadius: 14,
              padding: "10px 14px",
              fontWeight: 800,
              color: "#9a6b12",
              textAlign: "center",
            }}
          >
            ⭐ {child.stars} sao
          </div>
        </div>
      </div>
      {toastEl}
    </main>
  );
}

function Modal({
  name,
  setName,
  world,
  setWorld,
  onClose,
  onSubmit,
}: {
  name: string;
  setName: (v: string) => void;
  world: string;
  setWorld: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}>
          ✕
        </button>
        <p className="section-label">THÊM BÉ</p>
        <h3>Bé nhà mình tên gì?</h3>

        <div style={{ fontWeight: 800, marginBottom: 6 }}>Tên gọi ở nhà</div>
        <input
          className="field"
          placeholder="Ví dụ: Bông, Sữa…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div style={{ fontWeight: 800, marginBottom: 6 }}>Thế giới của bé</div>
        <div className="world-grid">
          {worlds.map((w) => (
            <button
              key={w.key}
              className={`opt-tile ${world === w.key ? "on" : ""}`}
              onClick={() => setWorld(w.key)}
            >
              <div className="t">
                {w.emoji} {w.label}
              </div>
            </button>
          ))}
        </div>

        <button className="btn btn-block" onClick={onSubmit}>
          Tạo hồ sơ cho bé 🎉
        </button>
      </div>
    </div>
  );
}
