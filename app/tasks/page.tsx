"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useChild } from "@/components/ChildContext";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/components/useToast";
import { createClient } from "@/lib/supabase/client";
import { confettiBurst, playSuccess } from "@/components/celebrate";

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

const EMOJIS = [
  "🌟", "📚", "🧸", "💧", "🪥", "🌱", "🎨", "⚽",
  "🎵", "🧩", "🧹", "🛁", "🥛", "🍎", "✏️", "🐾",
];

const CATEGORIES = ["Vệ sinh", "Việc nhà", "Học tập", "Sức khỏe", "Nề nếp", "Khám phá"];

// Gợi ý nhanh cho ba mẹ (biểu tượng · tên · nhóm · độ khó).
const SUGGESTIONS: { icon: string; name: string; category: string; stars: number }[] = [
  { icon: "🪥", name: "Đánh răng thật sạch", category: "Vệ sinh", stars: 1 },
  { icon: "💧", name: "Rửa tay trước khi ăn", category: "Vệ sinh", stars: 1 },
  { icon: "🛁", name: "Tắm rửa sạch sẽ", category: "Vệ sinh", stars: 1 },
  { icon: "📚", name: "Đọc sách 10 phút", category: "Học tập", stars: 2 },
  { icon: "🧸", name: "Cất đồ chơi đúng chỗ", category: "Việc nhà", stars: 1 },
  { icon: "🍎", name: "Ăn hết phần rau", category: "Sức khỏe", stars: 2 },
];

type Task = {
  id: string;
  name: string;
  icon: string;
  category: string | null;
  stars: number;
  sort: number;
};

const todayISO = () => new Date().toISOString().slice(0, 10); // ngày UTC, khớp mặc định CSDL

const todayVi = () => {
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${days[d.getDay()]}, ${dd}/${mm}`;
};

export default function TasksPage() {
  const { child, children, ready, createChild, setActive, addStars } = useChild();
  const { user } = useAuth();
  const { showToast, toastEl } = useToast();
  const supabase = useMemo(() => createClient(), []);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const worldMeta = worlds.find((w) => w.key === child?.world) ?? worlds[7];
  // Chỉ theo dõi id của bé đang chọn — tránh reload khi số sao đổi (child là
  // object mới mỗi lần cộng sao, sẽ làm reset ô tick đang chờ ghi vào CSDL).
  const childId = child?.id ?? null;

  // ---- Nạp nhiệm vụ + tiến độ hôm nay của bé đang chọn ----
  const loadTasks = useCallback(
    async (childId: string) => {
      setLoadingTasks(true);
      const [{ data: t }, { data: c }] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, name, icon, category, stars, sort")
          .eq("child_id", childId)
          .order("sort", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("task_completions")
          .select("task_id")
          .eq("child_id", childId)
          .eq("done_on", todayISO()),
      ]);
      setTasks((t ?? []) as Task[]);
      setDone(new Set(((c ?? []) as { task_id: string }[]).map((r) => r.task_id)));
      setLoadingTasks(false);
    },
    [supabase]
  );

  useEffect(() => {
    void (async () => {
      if (childId && childId !== "local") {
        setEditMode(false);
        await loadTasks(childId);
      } else {
        setTasks([]);
        setDone(new Set());
      }
    })();
  }, [childId, loadTasks]);

  const totalTasks = tasks.length;
  const doneCount = done.size;
  const pct = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;
  const allDone = totalTasks > 0 && doneCount === totalTasks;

  // ---- Tick / bỏ tick một nhiệm vụ (lưu tiến độ + sao vào CSDL) ----
  const toggle = async (t: Task, ev: React.MouseEvent) => {
    if (!child || !user) return;
    const isDone = done.has(t.id);
    setDone((prev) => {
      const next = new Set(prev);
      if (isDone) next.delete(t.id);
      else next.add(t.id);
      return next;
    });

    if (isDone) {
      addStars(-t.stars);
      await supabase
        .from("task_completions")
        .delete()
        .eq("task_id", t.id)
        .eq("done_on", todayISO());
    } else {
      addStars(t.stars);
      playSuccess();
      confettiBurst(ev.clientX, ev.clientY);
      showToast(`+${t.stars} ⭐ Giỏi lắm ${child.name}!`);
      await supabase.from("task_completions").insert({
        task_id: t.id,
        child_id: child.id,
        user_id: user.id,
        done_on: todayISO(),
      });
    }
  };

  // ---- Xoá nhiệm vụ ----
  const removeTask = async (t: Task) => {
    if (!confirm(`Xoá nhiệm vụ "${t.name}"?`)) return;
    setTasks((prev) => prev.filter((x) => x.id !== t.id));
    setDone((prev) => {
      const next = new Set(prev);
      next.delete(t.id);
      return next;
    });
    await supabase.from("tasks").delete().eq("id", t.id);
  };

  // ---- Thêm mới hoặc sửa nhiệm vụ ----
  const saveTask = async (draft: { name: string; icon: string; category: string; stars: number }) => {
    if (!child || !user) return;
    const fields = {
      name: draft.name.trim(),
      icon: draft.icon,
      category: draft.category || null,
      stars: draft.stars,
    };

    if (editingTask) {
      const { data, error } = await supabase
        .from("tasks")
        .update(fields)
        .eq("id", editingTask.id)
        .select("id, name, icon, category, stars, sort")
        .single();
      if (error || !data) {
        showToast("Chưa lưu được, thử lại nhé!");
        return;
      }
      setTasks((prev) => prev.map((x) => (x.id === editingTask.id ? (data as Task) : x)));
      showToast("Đã cập nhật nhiệm vụ ✏️");
    } else {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ child_id: child.id, user_id: user.id, sort: tasks.length, ...fields })
        .select("id, name, icon, category, stars, sort")
        .single();
      if (error || !data) {
        showToast("Chưa lưu được, thử lại nhé!");
        return;
      }
      setTasks((prev) => [...prev, data as Task]);
      showToast("Đã gieo nhiệm vụ mới 🌱");
    }
    setTaskModal(false);
    setEditingTask(null);
  };

  const openAddTask = () => {
    setEditingTask(null);
    setTaskModal(true);
  };
  const openEditTask = (t: Task) => {
    setEditingTask(t);
    setTaskModal(true);
  };
  const closeTaskModal = () => {
    setTaskModal(false);
    setEditingTask(null);
  };

  const enterEdit = () => {
    if (editMode) setEditMode(false);
    else setShowGate(true);
  };

  if (!ready) return <main className="wrap" />;

  // ---- Chưa có hồ sơ bé nào: màn chào ----
  if (!child) {
    return (
      <main className="wrap">
        <p className="page-eyebrow">Nhiệm vụ mỗi ngày</p>
        <h1 className="page-title" style={{ textAlign: "left", fontSize: 34 }}>
          Vườn Nhiệm Vụ
        </h1>
        <div className="panel" style={{ maxWidth: 640, margin: "24px auto", textAlign: "center" }}>
          <div style={{ fontSize: 54 }}>🐰</div>
          <h2 style={{ fontSize: 30, margin: "10px 0" }}>Chào mừng ba mẹ và bé!</h2>
          <p style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
            Tạo hồ sơ cho bé để bắt đầu: mỗi việc nhỏ hoàn thành là một lần bạn đồng hành
            reo hò, sao tích lũy và rương quà chờ mở cuối ngày.
          </p>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => setShowProfile(true)}>
            Tạo hồ sơ cho bé 🎉
          </button>
        </div>

        {showProfile && (
          <ProfileModal
            onClose={() => setShowProfile(false)}
            onCreate={async (name, world) => {
              await createChild(name, world);
              setShowProfile(false);
            }}
          />
        )}
        {toastEl}
      </main>
    );
  }

  // ---- Bảng nhiệm vụ ----
  return (
    <main className="wrap">
      <div className="task-top">
        <div>
          <p className="page-eyebrow" style={{ textAlign: "left" }}>
            {editMode ? "Ba mẹ đang chỉnh sửa" : "Nhiệm vụ mỗi ngày"}
          </p>
          <h1 className="page-title" style={{ textAlign: "left", fontSize: 34, margin: 0 }}>
            {worldMeta.label} Nhiệm Vụ
          </h1>
          <p style={{ color: "var(--ink-soft)", fontWeight: 700, marginTop: 4 }}>
            📅 {todayVi()}
          </p>
        </div>
        <button
          className={`edit-toggle ${editMode ? "on" : ""}`}
          onClick={enterEdit}
          title={editMode ? "Xong" : "Chế độ chỉnh sửa"}
        >
          {editMode ? "✓ Xong" : "✏️"}
        </button>
      </div>

      {/* Chọn bé + thêm bé */}
      <div className="child-switch">
        {children.map((c) => {
          const wm = worlds.find((w) => w.key === c.world) ?? worlds[7];
          return (
            <button
              key={c.id}
              className={`pill ${c.id === child.id ? "on" : ""}`}
              onClick={() => setActive(c.id)}
            >
              {wm.emoji} {c.name}
            </button>
          );
        })}
        <button className="pill" onClick={() => setShowProfile(true)}>
          + Thêm bé
        </button>
      </div>

      <div className="task-hero">
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          {worldMeta.emoji} Đường đến kho báu
        </div>
        <div style={{ opacity: 0.9, fontSize: 14 }}>
          {totalTasks === 0
            ? "Thêm nhiệm vụ đầu tiên để bắt đầu hành trình!"
            : allDone
            ? "Bé đã hoàn thành mọi nhiệm vụ hôm nay! 🎊"
            : `Còn ${totalTasks - doneCount} việc nữa là mở được rương quà!`}
        </div>
        <div className="bar">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="task-cols">
        <div className="panel">
          <div className="task-panel-head">
            <div>
              <p className="section-label">
                {editMode ? "BA MẸ ĐANG CHỈNH SỬA" : "CHUYẾN PHIÊU LƯU HÔM NAY"}
              </p>
              <h3 style={{ margin: 0, fontSize: 24 }}>
                Việc nhỏ của <span style={{ color: "var(--pink)" }}>{child.name}</span>
              </h3>
            </div>
            {editMode && (
              <button className="btn" onClick={openAddTask}>
                + Thêm nhiệm vụ
              </button>
            )}
          </div>

          {loadingTasks ? (
            <p style={{ color: "var(--muted)", padding: "20px 0" }}>Đang tải…</p>
          ) : totalTasks === 0 ? (
            <div className="empty-tasks">
              <div style={{ fontSize: 40 }}>🌱</div>
              <p>Chưa có nhiệm vụ nào. Bấm ✏️ rồi “Thêm nhiệm vụ” để gieo việc đầu tiên nhé!</p>
            </div>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className={`task-item ${done.has(t.id) ? "done" : ""}`}>
                <span className="ic">{t.icon}</span>
                <div className="txt">
                  <div className="name">{t.name}</div>
                  <div className="sub">
                    {t.category ? `${t.category} · ` : ""}+{t.stars} {"⭐".repeat(t.stars)}
                  </div>
                </div>
                {editMode && (
                  <>
                    <button
                      className="task-edit"
                      onClick={() => openEditTask(t)}
                      title="Sửa nhiệm vụ"
                    >
                      ✏️
                    </button>
                    <button
                      className="task-del"
                      onClick={() => removeTask(t)}
                      title="Xoá nhiệm vụ"
                    >
                      🗑️
                    </button>
                  </>
                )}
                <button className="check" onClick={(e) => toggle(t, e)}>
                  {done.has(t.id) ? "✓" : ""}
                </button>
              </div>
            ))
          )}

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
            <i style={{ width: `${Math.max(8, pct)}%` }} />
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

      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          onCreate={async (name, world) => {
            await createChild(name, world);
            setShowProfile(false);
          }}
        />
      )}

      {showGate && (
        <GateModal
          onClose={() => setShowGate(false)}
          onPass={() => {
            setShowGate(false);
            setEditMode(true);
          }}
        />
      )}

      {taskModal && (
        <TaskModal
          initial={editingTask ?? undefined}
          onClose={closeTaskModal}
          onSubmit={saveTask}
        />
      )}
      {toastEl}
    </main>
  );
}

/* ---------- Modal tạo hồ sơ bé ---------- */
function ProfileModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, world: string) => void;
}) {
  const [name, setName] = useState("");
  const [world, setWorld] = useState("carrot");
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}>✕</button>
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
              <div className="t">{w.emoji} {w.label}</div>
            </button>
          ))}
        </div>

        <button className="btn btn-block" onClick={() => onCreate(name, world)}>
          Tạo hồ sơ cho bé 🎉
        </button>
      </div>
    </div>
  );
}

/* ---------- Cổng xác nhận ba mẹ (giải toán) ---------- */
function GateModal({ onClose, onPass }: { onClose: () => void; onPass: () => void }) {
  // Số cố định trong vòng đời modal (không dùng Math.random ở render).
  const [ab] = useState(() => {
    const seed = new Date().getSeconds() + new Date().getMinutes() * 7;
    const a = 3 + (seed % 7); // 3..9
    const b = 2 + ((seed >> 2) % 6); // 2..7
    return { a, b };
  });
  const [val, setVal] = useState("");
  const [wrong, setWrong] = useState(false);

  const check = () => {
    if (parseInt(val, 10) === ab.a + ab.b) onPass();
    else {
      setWrong(true);
      setVal("");
    }
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}>✕</button>
        <p className="section-label">DÀNH CHO BA MẸ</p>
        <h3>Ba mẹ muốn chỉnh sửa?</h3>
        <p style={{ color: "var(--ink-soft)", lineHeight: 1.6, marginTop: -8 }}>
          Bước nhỏ này giúp bé không vô tình sửa nhiệm vụ, hồ sơ hoặc danh sách quà.
        </p>

        <p style={{ fontWeight: 800, textAlign: "center", color: "var(--ink-soft)", marginBottom: 4 }}>
          Nhập kết quả để tiếp tục
        </p>
        <div className={`gate-expr ${wrong ? "q-shake" : ""}`}>
          {ab.a} + {ab.b} = ?
        </div>
        <input
          className="field gate-input"
          inputMode="numeric"
          value={val}
          autoFocus
          onChange={(e) => {
            setWrong(false);
            setVal(e.target.value.replace(/\D/g, ""));
          }}
          onKeyDown={(e) => e.key === "Enter" && check()}
        />
        <button className="btn btn-block" onClick={check}>
          Mở chế độ chỉnh sửa
        </button>
      </div>
    </div>
  );
}

/* ---------- Modal thêm / sửa nhiệm vụ ---------- */
function TaskModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: { name: string; icon: string; category: string | null; stars: number };
  onClose: () => void;
  onSubmit: (draft: { name: string; icon: string; category: string; stars: number }) => void;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "🌟");
  const [stars, setStars] = useState(initial?.stars ?? 1);
  const [category, setCategory] = useState(initial?.category ?? "");

  const applySuggestion = (s: (typeof SUGGESTIONS)[number]) => {
    setName(s.name);
    setIcon(s.icon);
    setCategory(s.category);
    setStars(s.stars);
  };

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({ name, icon, category, stars });
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}>✕</button>
        <p className="section-label">{isEdit ? "SỬA NHIỆM VỤ" : "NHIỆM VỤ MỚI"}</p>
        <h3>{isEdit ? "Chỉnh lại việc này nhé" : "Hôm nay mình sẽ…"}</h3>

        <div className="suggest-row">
          {SUGGESTIONS.map((s) => (
            <button key={s.name} className="chip" onClick={() => applySuggestion(s)}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        <div style={{ fontWeight: 800, margin: "6px 0" }}>Tên nhiệm vụ</div>
        <input
          className="field"
          placeholder="Ví dụ: Tưới cây cùng mẹ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="lbl-row">
          <span style={{ fontWeight: 800 }}>Chọn biểu tượng</span>
          <span style={{ color: "var(--muted)", fontWeight: 700 }}>
            Đang chọn: {icon}
          </span>
        </div>
        <div className="emoji-grid">
          {EMOJIS.map((e) => (
            <button
              key={e}
              className={`emoji-tile ${icon === e ? "on" : ""}`}
              onClick={() => setIcon(e)}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="star-cat-row">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, margin: "6px 0" }}>Số sao (độ khó)</div>
            <div className="star-tiles">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  className={`star-tile ${stars === n ? "on" : ""}`}
                  onClick={() => setStars(n)}
                >
                  {"⭐".repeat(n)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, margin: "6px 0" }}>Nhóm</div>
            <select
              className="field"
              style={{ marginBottom: 0 }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">— Không —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn btn-block" style={{ marginTop: 18 }} onClick={submit}>
          {isEdit ? "Lưu thay đổi 💾" : "Gieo nhiệm vụ 🌱"}
        </button>
      </div>
    </div>
  );
}
