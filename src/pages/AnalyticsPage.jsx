import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { apiFetch } from "../lib/api.js";
import { useSelection } from "../context/SelectionContext.jsx";
import { SkeletonLoader, SkeletonCards } from "../components/ui/SkeletonLoader.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";

/* ─── Chart color tokens (Section 5.1 + Section 8) ─── */
const RISK_COLORS = {
  RED: "#DC2626",
  ORANGE: "#D97706",
  GREEN: "#16A34A",
};

const PRIORITY_COLORS = {
  IMMEDIATE: "#DC2626",
  "SHORT-TERM": "#EA580C",
  "MEDIUM-TERM": "#D97706",
  ROUTINE: "#16A34A",
};

const FACTOR_COLORS = {
  high: "#DC2626",
  medium: "#D97706",
  low: "#9CA3AF",
};

/* ─── Recharts theme — dark, no axes lines, tight grid ─── */
const CHART_THEME = {
  bg: "transparent",
  gridColor: "#1E2330",
  axisColor: "#9CA3AF",
  tooltipBg: "#12151C",
  tooltipBorder: "#1E2330",
  tooltipText: "#E8EAED",
  tooltipSecondary: "#9CA3AF",
};

/* ─── Custom tooltip (dark-themed, monospace for numbers) ─── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: CHART_THEME.tooltipBg,
        border: `1px solid ${CHART_THEME.tooltipBorder}`,
        borderRadius: 4,
        padding: "8px 12px",
      }}
    >
      <p style={{ color: CHART_THEME.tooltipText, fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || CHART_THEME.tooltipSecondary, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

/* ─── Section header ─── */
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h3 className="text-[14px] font-semibold text-phase-text">{title}</h3>
      {subtitle && <p className="text-[11px] text-phase-text-secondary mt-0.5">{subtitle}</p>}
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({ label, value, color, sub }) {
  return (
    <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4">
      <span className="text-[10px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">{label}</span>
      <span className="text-[24px] font-mono font-bold" style={{ color: color || "#E8EAED" }}>{value}</span>
      {sub && <span className="text-[11px] text-phase-text-secondary font-mono block mt-1">{sub}</span>}
    </div>
  );
}

/* ─── Aggregation helpers ─── */
function aggregateRiskLevels(villages) {
  const counts = { RED: 0, ORANGE: 0, GREEN: 0 };
  villages.forEach((v) => { counts[v.risk_level]++; });
  return Object.entries(counts).map(([level, count]) => ({ level, count }));
}

function aggregatePriorities(villages) {
  const counts = { IMMEDIATE: 0, "SHORT-TERM": 0, "MEDIUM-TERM": 0, ROUTINE: 0 };
  villages.forEach((v) => { counts[v.relocation_priority]++; });
  return Object.entries(counts).map(([priority, count]) => ({ priority, count }));
}

function riskScoreHistogram(villages) {
  const buckets = [
    { range: "0.0–0.2", min: 0, max: 0.2, count: 0 },
    { range: "0.2–0.4", min: 0.2, max: 0.4, count: 0 },
    { range: "0.4–0.6", min: 0.4, max: 0.6, count: 0 },
    { range: "0.6–0.8", min: 0.6, max: 0.8, count: 0 },
    { range: "0.8–1.0", min: 0.8, max: 1.01, count: 0 },
  ];
  villages.forEach((v) => {
    const b = buckets.find((b) => v.risk_score >= b.min && v.risk_score < b.max);
    if (b) b.count++;
  });
  return buckets.map(({ range, count }) => ({ range, count }));
}

function populationByRisk(villages) {
  const agg = {};
  villages.forEach((v) => {
    if (!agg[v.risk_level]) agg[v.risk_level] = { level: v.risk_level, population: 0, villages: 0 };
    agg[v.risk_level].population += v.population;
    agg[v.risk_level].villages++;
  });
  return Object.values(agg);
}

function siteCapacityData(sites) {
  return sites
    .map((s) => ({
      name: s.name.length > 18 ? s.name.slice(0, 16) + "…" : s.name,
      fullName: s.name,
      occupied: s.occupied,
      available: s.available,
      total: s.total_capacity,
      pct: Math.round((s.occupied / s.total_capacity) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);
}

function aggregateTopFactors(villages) {
  const factorCounts = {};
  villages.forEach((v) => {
    v.top_factors.forEach((f) => {
      if (!factorCounts[f.feature]) {
        factorCounts[f.feature] = { feature: f.feature, high: 0, medium: 0, low: 0, total: 0 };
      }
      factorCounts[f.feature][f.impact]++;
      factorCounts[f.feature].total++;
    });
  });
  return Object.values(factorCounts)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

function capacityTierColor(pct) {
  if (pct >= 90) return "#DC2626";
  if (pct >= 70) return "#D97706";
  return "#16A34A";
}

/* ─── Main page ─── */
export default function AnalyticsPage() {
  const { selectedState, selectedDistrict } = useSelection();

  const villageQueryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (selectedDistrict) p.set("district", selectedDistrict);
    else if (selectedState) p.set("state", selectedState);
    return p.toString();
  }, [selectedState, selectedDistrict]);

  const siteQueryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (selectedDistrict) p.set("district", selectedDistrict);
    else if (selectedState) p.set("state", selectedState);
    return p.toString();
  }, [selectedState, selectedDistrict]);

  const villageQS = villageQueryParams ? `?${villageQueryParams}` : "";
  const siteQS = siteQueryParams ? `?${siteQueryParams}` : "";

  const { data: villages = [], isLoading: villagesLoading, error: villagesError, refetch: refetchVillages } = useQuery({
    queryKey: ["villages", "analytics", villageQS],
    queryFn: () => apiFetch(`/api/villages${villageQS}`),
    staleTime: 30_000,
  });

  const { data: sites = [], isLoading: sitesLoading, error: sitesError, refetch: refetchSites } = useQuery({
    queryKey: ["sites", "analytics", siteQS],
    queryFn: () => apiFetch(`/api/sites${siteQS}`),
    staleTime: 30_000,
  });

  const filteredVillages = villages;
  const filteredSites = sites;

  const riskData = useMemo(() => aggregateRiskLevels(filteredVillages), [filteredVillages]);
  const priorityData = useMemo(() => aggregatePriorities(filteredVillages), [filteredVillages]);
  const histogramData = useMemo(() => riskScoreHistogram(filteredVillages), [filteredVillages]);
  const popData = useMemo(() => populationByRisk(filteredVillages), [filteredVillages]);
  const capacityData = useMemo(() => siteCapacityData(filteredSites), [filteredSites]);
  const factorData = useMemo(() => aggregateTopFactors(filteredVillages), [filteredVillages]);

  const isLoading = villagesLoading || sitesLoading;
  const error = villagesError || sitesError;

  const subtitle = useMemo(() => {
    if (selectedDistrict) return `${selectedState || ""} / ${selectedDistrict}`;
    if (selectedState) return selectedState;
    return "All regions";
  }, [selectedState, selectedDistrict]);

  const totalPop = filteredVillages.reduce((s, v) => s + v.population, 0);
  const redPop = filteredVillages.filter((v) => v.risk_level === "RED").reduce((s, v) => s + v.population, 0);
  const avgRisk = filteredVillages.length > 0 ? (filteredVillages.reduce((s, v) => s + v.risk_score, 0) / filteredVillages.length).toFixed(2) : "0.00";
  const lowConfCount = filteredVillages.filter((v) => v.low_confidence).length;

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto bg-phase-bg p-6">
        <div className="flex items-end justify-between border-b border-[#1E2330] pb-3 mb-6">
          <div>
            <h2 className="text-[20px] font-semibold text-phase-text">Analytics</h2>
            <div className="h-4 w-64 bg-surface-container-high rounded-[2px] mt-2 animate-pulse" />
          </div>
        </div>
        <SkeletonCards count={5} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-5 h-[280px] animate-pulse" />
          <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-5 h-[280px] animate-pulse" />
        </div>
        <div className="mt-8"><SkeletonBars count={4} /></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto bg-phase-bg p-6">
        <div className="flex items-end justify-between border-b border-[#1E2330] pb-3 mb-6">
          <div>
            <h2 className="text-[20px] font-semibold text-phase-text">Analytics</h2>
            <p className="text-[13px] text-phase-text-secondary mt-1">{subtitle}</p>
          </div>
        </div>
        <ErrorState onRetry={() => { refetchVillages(); refetchSites(); }} />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-phase-bg p-6">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-[#1E2330] pb-3 mb-6">
        <div>
          <h2 className="text-[20px] font-semibold text-phase-text">Analytics</h2>
          <p className="text-[13px] text-phase-text-secondary mt-1">
            Risk distribution and capacity trends — {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 text-phase-text-secondary bg-phase-elevated px-3 py-1 border border-[#1E2330] rounded-[2px]">
          <span className="text-[12px] font-mono">{filteredVillages.length} villages</span>
          <span className="text-[#1E2330]">|</span>
          <span className="text-[12px] font-mono">{filteredSites.length} sites</span>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Villages" value={filteredVillages.length} />
        <StatCard label="RED Risk Villages" value={riskData.find((d) => d.level === "RED")?.count || 0} color="#DC2626" />
        <StatCard label="ORANGE Risk Villages" value={riskData.find((d) => d.level === "ORANGE")?.count || 0} color="#D97706" />
        <StatCard label="Population at Risk" value={redPop.toLocaleString()} sub={`of ${totalPop.toLocaleString()} total`} />
        <StatCard label="Avg Risk Score" value={avgRisk} sub={`${lowConfCount} low-confidence`} />
      </div>

      {/* Row 1: Risk Level + Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Risk Level Distribution */}
        <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-5">
          <SectionHeader title="Risk Level Distribution" subtitle="Village count by risk_level" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fill: CHART_THEME.axisColor, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="level"
                tick={{ fill: CHART_THEME.axisColor, fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={65}
              />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Villages" radius={[0, 4, 4, 0]} barSize={28}>
                {riskData.map((entry) => (
                  <Cell key={entry.level} fill={RISK_COLORS[entry.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Relocation Priority Distribution */}
        <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-5">
          <SectionHeader title="Relocation Priority" subtitle="Village count by relocation_priority" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fill: CHART_THEME.axisColor, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="priority"
                tick={{ fill: CHART_THEME.axisColor, fontSize: 11, fontFamily: "JetBrains Mono", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Villages" radius={[0, 4, 4, 0]} barSize={28}>
                {priorityData.map((entry) => (
                  <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Risk Score Histogram + Population at Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Risk Score Distribution (Histogram) */}
        <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-5">
          <SectionHeader title="Risk Score Distribution" subtitle="Village count by risk_score range (0.0–1.0)" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={histogramData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} vertical={false} />
              <XAxis dataKey="range" tick={{ fill: CHART_THEME.axisColor, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART_THEME.axisColor, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Villages" radius={[4, 4, 0, 0]} barSize={36}>
                {histogramData.map((entry) => {
                  const mid = (parseFloat(entry.range.split("–")[0]) + parseFloat(entry.range.split("–")[1])) / 2;
                  const color = mid < 0.3 ? "#16A34A" : mid < 0.6 ? "#D97706" : mid < 0.8 ? "#EA580C" : "#DC2626";
                  return <Cell key={entry.range} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Population at Risk */}
        <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-5">
          <SectionHeader title="Population at Risk" subtitle="Total population by risk_level" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={popData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} vertical={false} />
              <XAxis dataKey="level" tick={{ fill: CHART_THEME.axisColor, fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART_THEME.axisColor, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="population" name="Population" radius={[4, 4, 0, 0]} barSize={48}>
                {popData.map((entry) => (
                  <Cell key={entry.level} fill={RISK_COLORS[entry.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {popData.map((d) => (
              <div key={d.level} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: RISK_COLORS[d.level] }} />
                <span className="text-[11px] font-mono text-phase-text-secondary">
                  {d.level}: {d.villages} vil, {d.population.toLocaleString()} pop
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Site Capacity Utilization (full width) */}
      <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-5 mb-8">
        <SectionHeader title="Site Capacity Utilization" subtitle="Occupied vs available capacity per relocation site" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={capacityData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: CHART_THEME.axisColor, fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: CHART_THEME.axisColor, fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              width={150}
            />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
              formatter={(value) => <span style={{ color: CHART_THEME.axisColor }}>{value}</span>}
            />
            <Bar dataKey="occupied" name="Occupied" stackId="a" radius={[0, 0, 0, 0]} barSize={22}>
              {capacityData.map((entry) => (
                <Cell key={entry.name} fill={capacityTierColor(entry.pct)} />
              ))}
            </Bar>
            <Bar dataKey="available" name="Available" stackId="a" radius={[0, 4, 4, 0]} barSize={22} fill="#2A3040" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3">
          {[
            { label: "≥90% occupied", color: "#DC2626" },
            { label: "70–90% occupied", color: "#D97706" },
            { label: "<70% occupied", color: "#16A34A" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: t.color }} />
              <span className="text-[11px] font-mono text-phase-text-secondary">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Top Contributing Factors (full width) */}
      <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-5 mb-8">
        <SectionHeader title="Top Contributing Factors" subtitle="Most frequently cited risk factors across all villages (from SHAP analysis)" />
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={factorData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} horizontal={false} />
            <XAxis type="number" tick={{ fill: CHART_THEME.axisColor, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="feature"
              tick={{ fill: CHART_THEME.axisColor, fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              width={160}
            />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
              formatter={(value) => <span style={{ color: CHART_THEME.axisColor }}>{value}</span>}
            />
            <Bar dataKey="high" name="High impact" stackId="a" barSize={20} fill={FACTOR_COLORS.high} />
            <Bar dataKey="medium" name="Medium impact" stackId="a" barSize={20} fill={FACTOR_COLORS.medium} />
            <Bar dataKey="low" name="Low impact" stackId="a" radius={[0, 4, 4, 0]} barSize={20} fill={FACTOR_COLORS.low} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer model info */}
      <div className="flex items-center justify-between pb-6">
        <span className="text-[11px] font-mono text-phase-text-secondary">
          Model: {filteredVillages[0]?.model_version || "N/A"} — last prediction: {filteredVillages[0]?.prediction_timestamp?.split("T")[0] || "N/A"}
        </span>
        <span className="text-[11px] font-mono text-phase-text-secondary">
          {lowConfCount} village{lowConfCount !== 1 ? "s" : ""} with low confidence flag
        </span>
      </div>
    </main>
  );
}
