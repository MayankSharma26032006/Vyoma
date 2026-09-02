/**
 * Carrying Capacity page.
 * Fetches sites from GET /api/sites instead of local mock data.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Icon from "../components/ui/Icon.jsx";
import { SkeletonBars } from "../components/ui/SkeletonLoader.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { apiFetch } from "../lib/api.js";
import { useSelection } from "../context/SelectionContext.jsx";

/**
 * Single source of truth for capacity threshold classification.
 * Rounds the percentage first, then applies the same >=90 / >=70 thresholds
 * everywhere — capacityColor, summaryStats, and the bar rendering all flow
 * through this one function so they can never disagree on a site.
 */
const TIER_COLORS = {
  red: "bg-severity-red",
  amber: "bg-severity-amber",
  green: "bg-severity-green",
};

function siteCapacityTier(site) {
  const pct = Math.round((site.occupied / site.total_capacity) * 100);
  const tier = pct >= 90 ? "red" : pct >= 70 ? "amber" : "green";
  return { pct, tier, color: TIER_COLORS[tier] };
}

function suitabilityTier(score) {
  if (score >= 80) return { label: "High", color: "text-severity-green" };
  if (score >= 60) return { label: "Medium", color: "text-severity-amber" };
  return { label: "Low", color: "text-severity-red" };
}

function summaryStats(sites) {
  const totalCapacity = sites.reduce((sum, s) => sum + s.total_capacity, 0);
  const totalOccupied = sites.reduce((sum, s) => sum + s.occupied, 0);
  const totalAvailable = sites.reduce((sum, s) => sum + s.available, 0);
  const avgSuitability = Math.round(sites.reduce((sum, s) => sum + s.suitability_score, 0) / sites.length);
  const tiers = sites.map(siteCapacityTier);
  const redCount = tiers.filter((t) => t.tier === "red").length;
  const amberCount = tiers.filter((t) => t.tier === "amber").length;
  const greenCount = tiers.filter((t) => t.tier === "green").length;
  return { totalCapacity, totalOccupied, totalAvailable, avgSuitability, redCount, amberCount, greenCount };
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4 h-24" />
      ))}
    </div>
  );
}

export default function CapacityPage() {
  const { selectedState, selectedDistrict } = useSelection();

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedDistrict) params.set("district", selectedDistrict);
    else if (selectedState) params.set("state", selectedState);
    return params.toString();
  }, [selectedState, selectedDistrict]);

  const { data: filteredSites = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sites", queryParams],
    queryFn: () => apiFetch(`/api/sites${queryParams ? `?${queryParams}` : ""}`),
  });

  const sorted = useMemo(() => [...filteredSites].sort((a, b) => (b.occupied / b.total_capacity) - (a.occupied / a.total_capacity)), [filteredSites]);
  const stats = useMemo(() => filteredSites.length > 0 ? summaryStats(filteredSites) : null, [filteredSites]);

  return (
    <main className="flex-1 overflow-y-auto bg-phase-bg p-6">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-[#1E2330] pb-3 mb-6">
        <div>
          <h2 className="text-[20px] font-semibold text-phase-text">Carrying Capacity</h2>
          <p className="text-[13px] text-phase-text-secondary mt-1">Site utilization across {selectedDistrict || selectedState || "all districts"}</p>
        </div>
        <a href="/sites" className="text-[12px] font-mono text-phase-text-secondary hover:text-phase-text transition-colors flex items-center gap-1">
          <Icon name="arrow_back" className="text-[14px]" />
          Back to Sites
        </a>
      </div>

      {isLoading ? (
        <>
          <SkeletonStats />
          <SkeletonBars count={4} />
        </>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : stats ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4 text-center">
              <span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">Total Capacity</span>
              <span className="text-[22px] font-mono font-bold text-phase-text">{stats.totalCapacity.toLocaleString()}</span>
            </div>
            <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4 text-center">
              <span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">Occupied</span>
              <span className="text-[22px] font-mono font-bold text-phase-text">{stats.totalOccupied.toLocaleString()}</span>
              <span className="text-[11px] text-phase-text-secondary font-mono block">{Math.round((stats.totalOccupied / stats.totalCapacity) * 100)}%</span>
            </div>
            <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4 text-center">
              <span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">Available</span>
              <span className="text-[22px] font-mono font-bold text-severity-green">{stats.totalAvailable.toLocaleString()}</span>
            </div>
            <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4 text-center">
              <span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">Avg Suitability</span>
              <span className="text-[22px] font-mono font-bold text-phase-text">{stats.avgSuitability}</span>
            </div>
          </div>

          {/* Threshold Legend */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[2px] bg-severity-red" />
              <span className="text-[11px] font-mono text-phase-text-secondary">{"\u2265"}90% occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[2px] bg-severity-amber" />
              <span className="text-[11px] font-mono text-phase-text-secondary">70-90% occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[2px] bg-severity-green" />
              <span className="text-[11px] font-mono text-phase-text-secondary">{"<"}70% occupied</span>
            </div>
            <div className="ml-auto flex items-center gap-3 text-[11px] font-mono text-phase-text-secondary">
              <span className="text-severity-red">{stats.redCount} critical</span>
              <span className="text-severity-amber">{stats.amberCount} near-capacity</span>
              <span className="text-severity-green">{stats.greenCount} available</span>
            </div>
          </div>

          {/* Capacity Bars */}
          <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4">
            <div className="flex flex-col gap-5">
              {sorted.map((s) => {
                const { pct, color: barColor } = siteCapacityTier(s);
                const tier = suitabilityTier(s.suitability_score);

                return (
                  <div key={s.site_id}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-phase-text font-medium">{s.name}</span>
                        <span className={`text-[10px] font-mono ${tier.color}`}>({tier.label})</span>
                        <span className="text-[11px] font-mono text-phase-text-secondary">{s.site_id}</span>
                      </div>
                      <span className="text-[12px] font-mono text-phase-text-secondary">
                        {s.occupied.toLocaleString()} / {s.total_capacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-[#1A1E28] rounded-[2px] h-3 overflow-hidden border border-[#1E2330]">
                      <div className={`${barColor} h-3 rounded-[2px] transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px] font-mono text-phase-text-secondary">{s.available.toLocaleString()} available</span>
                      <span className="text-[11px] font-mono text-phase-text-secondary">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Icon name="location_off" className="text-[48px] text-phase-text-secondary mb-3" />
          <p className="text-[14px] text-phase-text-secondary">No relocation sites registered for this district</p>
        </div>
      )}
    </main>
  );
}
