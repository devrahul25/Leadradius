"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.92)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 12,
  color: "#F8FAFC",
  backdropFilter: "blur(16px)",
};

const axisStyle = {
  fontSize: 11,
  fill: "#64748B",
};

interface SeriesPoint {
  label: string;
  value: number;
}

export function DailySearchesChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="searchFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="label" stroke="#64748B" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis stroke="#64748B" tick={axisStyle} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(139,92,246,0.4)" }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#A855F7"
          strokeWidth={2}
          fill="url(#searchFill)"
          activeDot={{ r: 4, fill: "#A855F7", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LeadsByCategoryChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="label" stroke="#64748B" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis stroke="#64748B" tick={axisStyle} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(139,92,246,0.06)" }} />
        <Bar dataKey="value" fill="url(#barFill)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const QUALITY_COLORS = ["#A855F7", "#22D3EE", "#FBBF24", "#475569"];

export function QualityDistributionChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={56}
          outerRadius={92}
          paddingAngle={3}
          stroke="rgba(0,0,0,0)"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={QUALITY_COLORS[i % QUALITY_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function LeadsByCityChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart layout="vertical" data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
        <XAxis type="number" stroke="#64748B" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" stroke="#64748B" tick={axisStyle} axisLine={false} tickLine={false} width={80} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(34,211,238,0.06)" }} />
        <Bar dataKey="value" fill="#22D3EE" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
