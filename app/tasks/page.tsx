"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/components/useToast";
import { createClient } from "@/lib/supabase/client";
import { confettiBurst, playSuccess } from "@/components/celebrate";
import Ambient from "@/components/Ambient";
import ThemeBuddy from "@/components/ThemeBuddy";
import WorldPicker from "@/components/WorldPicker";
import { getTheme, themeAsset, themeBgGradient } from "./worldThemes";
import {
  evaluateMissions,
  countByKind,
  localDayISO,
  type ActCounts,
  type MissionState,
} from "@/lib/missions";

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

const todayISO = () => localDayISO(); // ngày theo giờ địa phương (reset lúc nửa đêm)

// Định dạng ngày ISO (YYYY-MM-DD) → "Thứ Ba, 28/07" cho phần lịch sử.
const viDate = (iso: string) => {
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${days[date.getDay()]}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
};

const todayVi = () => {
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${days[d.getDay()]}, ${dd}/${mm}`;
};

export default function TasksPage() {
  const { child, children, ready, createChild, updateChild, deleteChild, setActive, addStars } =
    useChild();
  const { user } = useAuth();
  const { showToast, toastEl } = useToast();
  const supabase = useMemo(() => createClient(), []);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [counts, setCounts] = useState<ActCounts>({}); // đơn vị hoạt động đã làm hôm nay
  const [historyOpen, setHistoryOpen] = useState(false);
  const missions = useMemo(() => evaluateMissions(counts), [counts]);

  const [showProfile, setShowProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false); // true = sửa bé đang chọn
  const [editMode, setEditMode] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const theme = getTheme(child?.world);
  // Chỉ theo dõi id của bé đang chọn — tránh reload khi số sao đổi (child là
  // object mới mỗi lần cộng sao, sẽ làm reset ô tick đang chờ ghi vào CSDL).
  const childId = child?.id ?? null;

  // ---- Nạp nhiệm vụ + tiến độ hôm nay của bé đang chọn ----
  const loadTasks = useCallback(
    async (childId: string) => {
      setLoadingTasks(true);
      const [{ data: t }, { data: c }, { data: a }] = await Promise.all([
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
        supabase
          .from("activity_log")
          .select("kind, unit")
          .eq("child_id", childId)
          .eq("day", todayISO()),
      ]);
      setTasks((t ?? []) as Task[]);
      setDone(new Set(((c ?? []) as { task_id: string }[]).map((r) => r.task_id)));
      setCounts(countByKind((a ?? []) as { kind: string; unit: string }[]));
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
        setCounts({});
      }
    })();
  }, [childId, loadTasks]);

  // Bé làm hoạt động ở trang khác rồi quay lại → nạp lại để cập nhật nhiệm vụ.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "hidden" && childId && childId !== "local") {
        void loadTasks(childId);
      }
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [childId, loadTasks]);

  const missionsDone = missions.filter((m) => m.done).length;
  const totalTasks = tasks.length; // riêng nhóm "việc nhà" của ba mẹ
  const doneCount = done.size;
  const totalAll = missions.length + totalTasks; // 10 nhiệm vụ + việc nhà
  const doneAll = missionsDone + doneCount;
  const pct = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;
  const allDone = totalAll > 0 && doneAll === totalAll;

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

  const openAddChild = () => {
    setEditingProfile(false);
    setShowProfile(true);
  };
  const openEditChild = () => {
    setEditingProfile(true);
    setShowProfile(true);
  };
  const closeProfile = () => {
    setShowProfile(false);
    setEditingProfile(false);
  };
  const saveProfile = async (name: string, world: string) => {
    if (editingProfile && child) await updateChild(child.id, name, world);
    else await createChild(name, world);
    closeProfile();
  };
  const removeProfile = async () => {
    if (!child) return;
    if (!confirm(`Xoá hồ sơ của "${child.name}"? Mọi nhiệm vụ & sao sẽ mất.`)) return;
    await deleteChild(child.id);
    closeProfile();
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
          <button className="btn" style={{ marginTop: 16 }} onClick={openAddChild}>
            Tạo hồ sơ cho bé 🎉
          </button>
        </div>

        {showProfile && (
          <ProfileModal onClose={closeProfile} onSave={saveProfile} />
        )}
        {toastEl}
      </main>
    );
  }

  // ---- Bảng nhiệm vụ ----
  return (
    <main className="wrap">
      {/* Nền theo thế giới: ảnh /themes/<key>/bg.webp, chưa có thì rớt về gradient */}
      <div
        className="theme-scene"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${themeAsset(theme.key, "bg")}), ${themeBgGradient(theme)}`,
        }}
      />
      <Ambient kind={theme.ambient} color={theme.secondary} />
      <ThemeBuddy world={theme.key} cheering={allDone} />

      <div
        className={`task-top ${theme.headerInk === "#ffffff" ? "on-dark" : ""}`}
        style={{ color: theme.headerInk }}
      >
        <div>
          <p className="page-eyebrow" style={{ textAlign: "left", color: "inherit", opacity: 0.85 }}>
            {editMode ? "Ba mẹ đang chỉnh sửa" : "Nhiệm vụ mỗi ngày"}
          </p>
          <h1 className="page-title" style={{ textAlign: "left", fontSize: 34, margin: 0, color: "inherit" }}>
            {theme.label} Nhiệm Vụ
          </h1>
          <p style={{ color: "inherit", opacity: 0.9, fontWeight: 700, marginTop: 4 }}>
            📅 {todayVi()}
          </p>
        </div>
        <div className="task-top-actions">
          <WorldPicker
            worlds={worlds}
            current={child.world}
            onPick={(key) => updateChild(child.id, child.name, key)}
          />
          <button
            className="edit-toggle"
            onClick={() => setHistoryOpen(true)}
            title="Lịch sử nhiệm vụ các ngày đã qua"
          >
            📅
          </button>
          <button
            className={`edit-toggle ${editMode ? "on" : ""}`}
            onClick={enterEdit}
            title={editMode ? "Xong" : "Chế độ chỉnh sửa"}
          >
            {editMode ? "✓ Xong" : "✏️"}
          </button>
        </div>
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
        {editMode && (
          <button className="pill" onClick={openEditChild}>
            ✏️ Sửa hồ sơ
          </button>
        )}
        <button className="pill" onClick={openAddChild}>
          + Thêm bé
        </button>
      </div>

      <div
        className="task-hero"
        style={{ background: `linear-gradient(120deg, ${theme.primary}, ${theme.dark})` }}
      >
        <div style={{ fontWeight: 800, fontSize: 18 }}>
          {theme.emoji} Đường đến kho báu
        </div>
        <div style={{ opacity: 0.9, fontSize: 14 }}>
          {allDone
            ? "Bé đã hoàn thành mọi nhiệm vụ hôm nay! 🎊"
            : `Còn ${totalAll - doneAll} việc nữa là mở được rương quà!`}
        </div>
        <div className="bar">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="task-cols">
        <div className="panel">
          {/* ---- 10 nhiệm vụ hoạt động tự động ---- */}
          <div className="task-panel-head">
            <div>
              <p className="section-label">TỰ ĐỘNG GHI NHẬN KHI BÉ HỌC</p>
              <h3 style={{ margin: 0, fontSize: 24 }}>
                10 nhiệm vụ của <span style={{ color: "var(--pink)" }}>{child.name}</span>
              </h3>
            </div>
            <div className="mission-count">
              {missionsDone}/{missions.length} ⭐
            </div>
          </div>

          {loadingTasks ? (
            <p style={{ color: "var(--muted)", padding: "20px 0" }}>Đang tải…</p>
          ) : (
            <div className="mission-list">
              {missions.map((m) => (
                <Link
                  key={m.key}
                  href={m.href}
                  className={`task-item mission ${m.done ? "done" : ""}`}
                >
                  <span className="ic">{m.icon}</span>
                  <div className="txt">
                    <div className="name">{m.label}</div>
                    <div className="sub">
                      {m.done ? "Đã hoàn thành! 🎉" : "Bấm để làm ngay →"}
                    </div>
                  </div>
                  <span className={`mission-badge ${m.done ? "on" : ""}`}>
                    {m.done ? "✓" : `${m.have}/${m.need}`}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* ---- Việc nhà ba mẹ giao (tự tạo, tick tay) ---- */}
          <div className="task-panel-head" style={{ marginTop: 22 }}>
            <div>
              <p className="section-label">
                {editMode ? "BA MẸ ĐANG CHỈNH SỬA" : "VIỆC NHÀ BA MẸ GIAO"}
              </p>
              <h3 style={{ margin: 0, fontSize: 20 }}>Việc nhỏ mỗi ngày 🧸</h3>
            </div>
            {editMode && (
              <button className="btn" onClick={openAddTask}>
                + Thêm nhiệm vụ
              </button>
            )}
          </div>

          {!loadingTasks && totalTasks === 0 ? (
            <div className="empty-tasks">
              <div style={{ fontSize: 40 }}>🌱</div>
              <p>Chưa có việc nhà nào. Bấm 📅✏️ rồi “Thêm nhiệm vụ” để gieo việc đầu tiên nhé!</p>
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
          <div style={{ fontSize: 40, textAlign: "center" }}>{theme.emoji}</div>
          <div style={{ fontWeight: 800, textAlign: "center", fontSize: 18, color: theme.dark }}>
            {theme.buddyName}
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
              ? theme.praise[0]
              : theme.greeting}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Năng lượng</div>
          <div className="energy">
            <i style={{ width: `${Math.max(8, pct)}%`, background: `linear-gradient(90deg, ${theme.secondary}, ${theme.primary})` }} />
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
          initial={editingProfile && child ? { name: child.name, world: child.world } : undefined}
          onClose={closeProfile}
          onSave={saveProfile}
          onDelete={editingProfile ? removeProfile : undefined}
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

      {historyOpen && childId && childId !== "local" && (
        <HistoryModal childId={childId} onClose={() => setHistoryOpen(false)} />
      )}
      {toastEl}
    </main>
  );
}

/* ---------- Modal lịch sử nhiệm vụ các ngày đã qua ---------- */
type HistoryDay = {
  day: string;
  missions: MissionState[];
  doneCount: number;
  chores: number; // số việc nhà tick trong ngày
};

function HistoryModal({ childId, onClose }: { childId: string; onClose: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [days, setDays] = useState<HistoryDay[] | null>(null);

  useEffect(() => {
    void (async () => {
      const today = localDayISO();
      const [{ data: logs }, { data: comps }] = await Promise.all([
        supabase
          .from("activity_log")
          .select("day, kind, unit")
          .eq("child_id", childId)
          .order("day", { ascending: false }),
        supabase
          .from("task_completions")
          .select("done_on")
          .eq("child_id", childId),
      ]);

      const byDay = new Map<string, { kind: string; unit: string }[]>();
      for (const r of (logs ?? []) as { day: string; kind: string; unit: string }[]) {
        const arr = byDay.get(r.day) ?? [];
        arr.push({ kind: r.kind, unit: r.unit });
        byDay.set(r.day, arr);
      }
      const choresByDay = new Map<string, number>();
      for (const r of (comps ?? []) as { done_on: string }[]) {
        choresByDay.set(r.done_on, (choresByDay.get(r.done_on) ?? 0) + 1);
      }

      const allDays = new Set<string>([...byDay.keys(), ...choresByDay.keys()]);
      const rows: HistoryDay[] = [...allDays]
        .filter((d) => d < today) // chỉ NGÀY ĐÃ QUA
        .sort()
        .reverse()
        .map((d) => {
          const ms = evaluateMissions(countByKind(byDay.get(d) ?? []));
          return {
            day: d,
            missions: ms,
            doneCount: ms.filter((m) => m.done).length,
            chores: choresByDay.get(d) ?? 0,
          };
        });
      setDays(rows);
    })();
  }, [childId, supabase]);

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}>✕</button>
        <p className="section-label">LỊCH SỬ NHIỆM VỤ</p>
        <h3>Những ngày đã qua 📅</h3>

        {days === null ? (
          <p style={{ color: "var(--muted)", padding: "16px 0" }}>Đang tải…</p>
        ) : days.length === 0 ? (
          <div className="empty-tasks">
            <div style={{ fontSize: 40 }}>🗓️</div>
            <p>Chưa có ngày nào trước đây. Cùng bé học hôm nay để tạo trang lịch sử đầu tiên nhé!</p>
          </div>
        ) : (
          <div className="history-list">
            {days.map((d) => (
              <div key={d.day} className="history-day">
                <div className="history-day-head">
                  <span className="history-date">{viDate(d.day)}</span>
                  <span className="history-score">
                    {d.doneCount}/{d.missions.length} hoạt động
                    {d.chores > 0 ? ` · ${d.chores} việc nhà` : ""}
                  </span>
                </div>
                <div className="history-icons">
                  {d.missions.map((m) => (
                    <span
                      key={m.key}
                      className={`history-ic ${m.done ? "on" : ""}`}
                      title={`${m.label}${m.done ? " — đã xong" : " — chưa xong"}`}
                    >
                      {m.icon}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Modal tạo / sửa hồ sơ bé ---------- */
function ProfileModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial?: { name: string; world: string };
  onClose: () => void;
  onSave: (name: string, world: string) => void;
  onDelete?: () => void;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [world, setWorld] = useState(initial?.world ?? "carrot");
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}>✕</button>
        <p className="section-label">{isEdit ? "SỬA HỒ SƠ" : "THÊM BÉ"}</p>
        <h3>{isEdit ? "Chỉnh hồ sơ của bé" : "Bé nhà mình tên gì?"}</h3>

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

        <button className="btn btn-block" onClick={() => onSave(name, world)}>
          {isEdit ? "Lưu hồ sơ 💾" : "Tạo hồ sơ cho bé 🎉"}
        </button>
        {onDelete && (
          <button className="btn btn-ghost btn-block profile-del" onClick={onDelete}>
            🗑️ Xoá hồ sơ bé này
          </button>
        )}
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
