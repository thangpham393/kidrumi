"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./AreaTrend.module.css";

export type TrendPoint = { label: string; value: number };

type Colors = {
  line: string;
  grid: string;
  axis: string;
};

function readColors(): Colors {
  const root = document.querySelector<HTMLElement>(".admin-root");
  const cs = root ? getComputedStyle(root) : getComputedStyle(document.documentElement);
  const get = (v: string, fb: string) => cs.getPropertyValue(v).trim() || fb;
  return {
    line: get("--viz-1", "#7C6CF6"),
    grid: get("--c-border", "#ECE9F8"),
    axis: get("--c-text-muted", "#9B9BB4"),
  };
}

function CustomTooltip({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tipLabel}>{label}</div>
      <div className={`${styles.tipValue} admin-num`}>
        {payload[0].value.toLocaleString("vi-VN")}
        {suffix ? ` ${suffix}` : ""}
      </div>
    </div>
  );
}

export default function AreaTrend({
  data,
  height = 260,
  suffix,
}: {
  data: TrendPoint[];
  height?: number;
  suffix?: string;
}) {
  const [colors, setColors] = useState<Colors | null>(null);

  useEffect(() => {
    const update = () => setColors(readColors());
    update();
    const root = document.querySelector(".admin-root");
    const mo = new MutationObserver(update);
    if (root) mo.observe(root, { attributes: true, attributeFilter: ["data-admin-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  // Chờ mount để tránh cảnh báo width=0 khi SSR và để đọc màu theo theme.
  if (!colors) return <div className={styles.placeholder} style={{ height }} aria-hidden="true" />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="areaTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.line} stopOpacity={0.22} />
            <stop offset="100%" stopColor={colors.line} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={colors.grid} strokeDasharray="0" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: colors.axis, fontSize: 12 }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          tick={{ fill: colors.axis, fontSize: 12 }}
        />
        <Tooltip
          content={<CustomTooltip suffix={suffix} />}
          cursor={{ stroke: colors.line, strokeOpacity: 0.3, strokeWidth: 1.5 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={colors.line}
          strokeWidth={2.5}
          fill="url(#areaTrendFill)"
          activeDot={{ r: 5, strokeWidth: 0 }}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
