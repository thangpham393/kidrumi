"use client";

// ---------------------------------------------------------------------------
// Góc ba mẹ — "Nhìn lại hành trình của bé".
//  · Tab "Thời gian sử dụng": đọc usage_log (theo tài khoản) → biểu đồ cột chồng
//    theo ngày + "Theo từng trò" + bảng số liệu theo ngày.
//  · Tab "Thống kê nhiệm vụ": đọc activity_log + task_completions của bé đang chọn
//    → mỗi ngày làm được mấy nhiệm vụ / việc nhà.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useAuth } from "@/components/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  SUBJECTS,
  SUBJECT_BY_KEY,
  GAME_BY_KEY,
  usageDayISO,
  type SubjectKey,
} from "@/lib/usage";
import {
  evaluateMissions,
  countByKind,
  type MissionState,
} from "@/lib/missions";

type UsageRow = { game: string; day: string; seconds: number; sessions: number };
type TaskLog = { day: string; kind: string; unit: string };

// Danh sách N ngày gần nhất (cũ → mới), theo giờ địa phương.
function lastNDays(n: number): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(usageDayISO(d));
  }
  return out;
}

// "2026-07-28" → "28/7"
const dm = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${d}/${m}`;
};

// giây → số phút hiển thị (tối thiểu 1 phút nếu có dùng)
const toMin = (s: number) => (s <= 0 ? 0 : Math.max(1, Math.round(s / 60)));

export default function ParentsPage() {
  const { child } = useChild();
  const { user, ready } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [tab, setTab] = useState<"time" | "tasks">("time");
  const [range, setRange] = useState<7 | 30>(7);
  const [usage, setUsage] = useState<UsageRow[] | null>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[] | null>(null);
  const [chores, setChores] = useState<Record<string, number>>({});

  const userId = user?.id ?? null;
  const childId = child?.id && child.id !== "local" ? child.id : null;
  const days = useMemo(() => lastNDays(range), [range]);
  const from = days[0];

  // ---- Nạp số liệu thời gian sử dụng (theo tài khoản) ----
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!userId) return;
      setUsage(null);
      const { data } = await supabase
        .from("usage_log")
        .select("game, day, seconds, sessions")
        .eq("user_id", userId)
        .gte("day", from);
      if (active) setUsage((data ?? []) as UsageRow[]);
    })();
    return () => {
      active = false;
    };
  }, [supabase, userId, from]);

  // ---- Nạp số liệu nhiệm vụ (của bé đang chọn) ----
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!childId) {
        if (active) {
          setTaskLogs([]);
          setChores({});
        }
        return;
      }
      setTaskLogs(null);
      const [{ data: logs }, { data: comps }] = await Promise.all([
        supabase
          .from("activity_log")
          .select("day, kind, unit")
          .eq("child_id", childId)
          .gte("day", from),
        supabase
          .from("task_completions")
          .select("done_on")
          .eq("child_id", childId)
          .gte("done_on", from),
      ]);
      if (!active) return;
      setTaskLogs((logs ?? []) as TaskLog[]);
      const ch: Record<string, number> = {};
      for (const r of (comps ?? []) as { done_on: string }[]) {
        ch[r.done_on] = (ch[r.done_on] ?? 0) + 1;
      }
      setChores(ch);
    })();
    return () => {
      active = false;
    };
  }, [supabase, childId, from]);

  // ---- Gom số liệu thời gian ----
  const time = useMemo(() => {
    const rows = usage ?? [];
    const perDay = new Map<string, Record<string, number>>(); // day → subject → giây
    const perGame = new Map<string, { secs: number; sessions: number }>();
    const subjTotal: Record<string, number> = {};
    let total = 0;

    for (const r of rows) {
      const def = GAME_BY_KEY[r.game];
      const subject = def?.subject ?? "math";
      total += r.seconds;
      subjTotal[subject] = (subjTotal[subject] ?? 0) + r.seconds;

      const dayRow = perDay.get(r.day) ?? {};
      dayRow[subject] = (dayRow[subject] ?? 0) + r.seconds;
      perDay.set(r.day, dayRow);

      const g = perGame.get(r.game) ?? { secs: 0, sessions: 0 };
      g.secs += r.seconds;
      g.sessions += r.sessions;
      perGame.set(r.game, g);
    }

    const activeSubjects = SUBJECTS.filter((s) => (subjTotal[s.key] ?? 0) > 0);
    const dayTotals = days.map((d) =>
      Object.values(perDay.get(d) ?? {}).reduce((a, b) => a + b, 0),
    );
    const maxDay = Math.max(1, ...dayTotals);

    const games = [...perGame.entries()]
      .map(([key, v]) => ({ key, ...v }))
      .filter((g) => g.secs > 0 || g.sessions > 0)
      .sort((a, b) => b.secs - a.secs);

    // Bảng theo ngày (mới → cũ), chỉ ngày có dùng.
    const table = days
      .filter((d) => (perDay.get(d) ?? null) !== null)
      .map((d) => ({ day: d, subj: perDay.get(d) ?? {} }))
      .filter((r) => Object.values(r.subj).some((s) => s > 0))
      .reverse();

    return { perDay, activeSubjects, dayTotals, maxDay, games, table, total };
  }, [usage, days]);

  // ---- Gom số liệu nhiệm vụ theo ngày (mới → cũ) ----
  const missionDays = useMemo(() => {
    if (!taskLogs) return null;
    const byDay = new Map<string, TaskLog[]>();
    for (const r of taskLogs) {
      const arr = byDay.get(r.day) ?? [];
      arr.push(r);
      byDay.set(r.day, arr);
    }
    const allDays = new Set<string>([...byDay.keys(), ...Object.keys(chores)]);
    return [...allDays]
      .filter((d) => d >= from)
      .sort()
      .reverse()
      .map((d) => {
        const ms = evaluateMissions(countByKind(byDay.get(d) ?? []));
        return {
          day: d,
          missions: ms,
          done: ms.filter((m) => m.done).length,
          chores: chores[d] ?? 0,
        };
      });
  }, [taskLogs, chores, from]);

  if (ready && !user) {
    return (
      <main className="wrap">
        <p className="page-eyebrow">Góc ba mẹ</p>
        <h1 className="page-title">Nhìn lại hành trình của bé</h1>
        <div className="panel" style={{ maxWidth: 560, margin: "18px auto", textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>🔒</div>
          <p style={{ color: "var(--ink-soft)", lineHeight: 1.6, margin: "10px 0 18px" }}>
            Ba mẹ đăng nhập để xem thống kê thời gian học và nhiệm vụ của bé nhé!
          </p>
          <Link href="/login?next=/parents" className="btn">
            Đăng nhập
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap">
      <p className="page-eyebrow">Góc ba mẹ</p>
      <h1 className="page-title">Nhìn lại hành trình của bé</h1>

      {/* Chuyển tab */}
      <div className="stat-tabs">
        <button
          className={`chip ${tab === "tasks" ? "on" : ""}`}
          onClick={() => setTab("tasks")}
        >
          📋 Thống kê nhiệm vụ
        </button>
        <button
          className={`chip ${tab === "time" ? "on" : ""}`}
          onClick={() => setTab("time")}
        >
          ⏱️ Thời gian sử dụng
        </button>
      </div>

      {tab === "time" ? (
        <>
          <div className="usage-head">
            <div className="usage-total">
              {range} ngày qua: <b>{toMin(time.total)} phút</b>
              <span className="usage-note"> · thời gian của cả nhà trên tài khoản này</span>
            </div>
            <div className="stat-range">
              <button className={`chip ${range === 7 ? "on" : ""}`} onClick={() => setRange(7)}>
                7 ngày
              </button>
              <button className={`chip ${range === 30 ? "on" : ""}`} onClick={() => setRange(30)}>
                30 ngày
              </button>
            </div>
          </div>

          {/* Biểu đồ cột chồng theo ngày */}
          <div className="panel usage-panel">
            {usage === null ? (
              <p className="stat-loading">Đang tải…</p>
            ) : time.total === 0 ? (
              <div className="stat-empty">
                <div style={{ fontSize: 42 }}>🌱</div>
                <p>Chưa có dữ liệu. Cùng bé học vài hoạt động rồi quay lại xem nhé!</p>
              </div>
            ) : (
              <>
                <div className="usage-chart">
                  {days.map((d, i) => {
                    const dayRow = time.perDay.get(d) ?? {};
                    const dayTotal = time.dayTotals[i];
                    return (
                      <div className="uc-col" key={d}>
                        <div className="uc-val">{dayTotal > 0 ? toMin(dayTotal) : ""}</div>
                        <div
                          className="uc-stack"
                          style={{ height: `${(dayTotal / time.maxDay) * 100}%` }}
                        >
                          {SUBJECTS.map((s) => {
                            const secs = dayRow[s.key] ?? 0;
                            if (secs <= 0) return null;
                            return (
                              <div
                                key={s.key}
                                className="uc-seg"
                                style={{
                                  flex: secs,
                                  background: s.color,
                                }}
                                title={`${s.label}: ${toMin(secs)} phút`}
                              />
                            );
                          })}
                        </div>
                        <div className="uc-day">{dm(d)}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="usage-legend">
                  {time.activeSubjects.map((s) => (
                    <span className="ul-item" key={s.key}>
                      <span className="ul-dot" style={{ background: s.color }} />
                      {s.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theo từng trò */}
          {time.games.length > 0 && (
            <div className="panel" style={{ marginTop: 18 }}>
              <p className="section-label">THEO TỪNG TRÒ</p>
              <div className="game-stat-list">
                {time.games.map((g) => {
                  const def = GAME_BY_KEY[g.key];
                  const subj = def ? SUBJECT_BY_KEY[def.subject] : null;
                  return (
                    <div className="gs-row" key={g.key}>
                      <span
                        className="gs-dot"
                        style={{ background: subj?.color ?? "var(--muted)" }}
                      />
                      <span className="gs-name">{def?.label ?? g.key}</span>
                      <span className="gs-min">{toMin(g.secs)} phút</span>
                      <span className="gs-lot">{g.sessions} lượt</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bảng số liệu theo ngày */}
          {time.table.length > 0 && (
            <div className="panel" style={{ marginTop: 18 }}>
              <p className="section-label">BẢNG SỐ LIỆU THEO NGÀY</p>
              <div className="day-table-wrap">
                <table className="day-table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      {time.activeSubjects.map((s) => (
                        <th key={s.key}>{s.label}</th>
                      ))}
                      <th>Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {time.table.map((r) => {
                      const rowTotal = Object.values(r.subj).reduce((a, b) => a + b, 0);
                      return (
                        <tr key={r.day}>
                          <td>{dm(r.day)}</td>
                          {time.activeSubjects.map((s) => {
                            const secs = (r.subj as Record<SubjectKey, number>)[s.key] ?? 0;
                            return (
                              <td key={s.key}>{secs > 0 ? `${toMin(secs)}p` : "—"}</td>
                            );
                          })}
                          <td className="total">{toMin(rowTotal)}p</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ---------- Tab thống kê nhiệm vụ ---------- */
        <>
          <div className="usage-head">
            <div className="usage-total">
              {child ? (
                <>
                  Nhiệm vụ của <b>{child.name}</b> · {range} ngày qua
                </>
              ) : (
                "Chọn hồ sơ bé để xem nhiệm vụ"
              )}
            </div>
            <div className="stat-range">
              <button className={`chip ${range === 7 ? "on" : ""}`} onClick={() => setRange(7)}>
                7 ngày
              </button>
              <button className={`chip ${range === 30 ? "on" : ""}`} onClick={() => setRange(30)}>
                30 ngày
              </button>
            </div>
          </div>

          <div className="panel usage-panel">
            {!childId ? (
              <div className="stat-empty">
                <div style={{ fontSize: 42 }}>🐰</div>
                <p>
                  Chưa chọn hồ sơ bé. Vào{" "}
                  <Link href="/tasks" style={{ color: "var(--brand)", fontWeight: 800 }}>
                    Nhiệm vụ
                  </Link>{" "}
                  để tạo/chọn bé nhé!
                </p>
              </div>
            ) : missionDays === null ? (
              <p className="stat-loading">Đang tải…</p>
            ) : missionDays.length === 0 ? (
              <div className="stat-empty">
                <div style={{ fontSize: 42 }}>🗓️</div>
                <p>Chưa có hoạt động nào trong khoảng này. Cùng bé học hôm nay nhé!</p>
              </div>
            ) : (
              <div className="history-list">
                {missionDays.map((d) => (
                  <div key={d.day} className="history-day">
                    <div className="history-day-head">
                      <span className="history-date">{dm(d.day)}</span>
                      <span className="history-score">
                        {d.done}/{d.missions.length} hoạt động
                        {d.chores > 0 ? ` · ${d.chores} việc nhà` : ""}
                      </span>
                    </div>
                    <div className="history-icons">
                      {d.missions.map((m: MissionState) => (
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
        </>
      )}
    </main>
  );
}
