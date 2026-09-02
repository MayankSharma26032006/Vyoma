/**
 * Relocation Sites table page.
 * Fetches from GET /api/sites instead of local mock data.
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Icon from "../components/ui/Icon.jsx";
import { SkeletonLoader } from "../components/ui/SkeletonLoader.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { apiFetch } from "../lib/api.js";
import { useSelection } from "../context/SelectionContext.jsx";

const INFRA_KEYS = [
  { key: "water_supply", label: "Water", icon: "water_drop" },
  { key: "electricity", label: "Power", icon: "bolt" },
  { key: "road_access", label: "Road", icon: "road" },
  { key: "shelter", label: "Shelter", icon: "roofing" },
  { key: "medical_facility", label: "Medical", icon: "medical_services" },
  { key: "sanitation", label: "Sanitation", icon: "sanitizer" },
];

function suitabilityTier(score) {
  if (score >= 80) return { label: "High", color: "text-severity-green" };
  if (score >= 60) return { label: "Medium", color: "text-severity-amber" };
  return { label: "Low", color: "text-severity-red" };
}

/**
 * Ensure infrastructure is a real object, not a JSON string.
 * Prisma Json fields should parse automatically, but add a safety net.
 */
function parseInfrastructure(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return {};
}

function SortIcon({ column, sortConfig }) {
  if (sortConfig.key !== column) return <Icon name="unfold_more" className="text-[14px] opacity-40" />;
  return <Icon name={sortConfig.direction === "asc" ? "arrow_upward" : "arrow_downward"} className="text-[14px]" />;
}

function FilterChip({ label, active, onClick, colorClass }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-[2px] text-[11px] font-mono border transition-colors ${
        active
          ? `${colorClass || "bg-phase-card"} border-phase-text/20 text-phase-text`
          : "bg-phase-bg border-[#1E2330] text-phase-text-secondary hover:border-[#2A3040]"
      }`}
    >
      {label}
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-[#1E2330]">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-4 bg-[#1A1E28] rounded-[2px] animate-pulse w-3/4" /></td>
      ))}
    </tr>
  );
}

export default function SitesPage() {
  const { selectedState, selectedDistrict } = useSelection();
  const [sortConfig, setSortConfig] = useState({ key: "site_id", direction: "asc" });
  const [filters, setFilters] = useState({ suitability: null });

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedDistrict) params.set("district", selectedDistrict);
    else if (selectedState) params.set("state", selectedState);
    return params.toString();
  }, [selectedState, selectedDistrict]);

  const { data: rawSites = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sites", queryParams],
    queryFn: () => apiFetch(`/api/sites${queryParams ? `?${queryParams}` : ""}`),
  });

  // Ensure infrastructure is parsed on each site
  const siteData = useMemo(() => rawSites.map((s) => ({ ...s, infrastructure: parseInfrastructure(s.infrastructure) })), [rawSites]);

  const sites = useMemo(() => {
    let result = [...siteData];

    if (filters.suitability) {
      result = result.filter((s) => {
        if (filters.suitability === "High") return s.suitability_score >= 80;
        if (filters.suitability === "Medium") return s.suitability_score >= 60 && s.suitability_score < 80;
        return s.suitability_score < 60;
      });
    }

    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [sortConfig, filters, siteData]);

  function handleSort(key) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function toggleFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  }

  const columns = [
    { key: "site_id", label: "Site ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "suitability_score", label: "Suitability", sortable: true },
    { key: "capacity", label: "Capacity", sortable: false },
    { key: "available", label: "Available", sortable: true },
    { key: "infrastructure", label: "Infrastructure", sortable: false },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-phase-bg p-6">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-[#1E2330] pb-3 mb-6">
        <div>
          <h2 className="text-[20px] font-semibold text-phase-text">Relocation Sites</h2>
          <p className="text-[13px] text-phase-text-secondary mt-1">Registered sites in {selectedDistrict || selectedState || "all districts"}</p>
        </div>
        <div className="flex items-center gap-2 text-phase-text-secondary bg-phase-elevated px-3 py-1 border border-[#1E2330] rounded-[2px]">
          <Icon name="sync" className="text-[14px]" />
          <span className="text-[12px] font-mono">{isLoading ? "..." : `${sites.length} sites`}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[11px] font-mono text-phase-text-secondary uppercase tracking-wider mr-1">Suitability:</span>
        {["High", "Medium", "Low"].map((tier) => (
          <FilterChip
            key={tier}
            label={tier}
            active={filters.suitability === tier}
            onClick={() => toggleFilter("suitability", tier)}
            colorClass={tier === "High" ? "bg-severity-green/10" : tier === "Medium" ? "bg-severity-amber/10" : "bg-severity-red/10"}
          />
        ))}
        {filters.suitability && (
          <button onClick={() => setFilters({ suitability: null })} className="px-3 py-1 rounded-[2px] border border-[#2A3040] text-phase-text-secondary text-[12px] font-mono hover:bg-phase-elevated transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] overflow-hidden">
        {isLoading ? (
          <table className="w-full text-left">
            <tbody>{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Icon name="location_off" className="text-[48px] text-phase-text-secondary mb-3" />
            <p className="text-[14px] text-phase-text-secondary mb-3">No relocation sites registered for this district</p>
            <button onClick={() => setFilters({ suitability: null })} className="px-3 py-1 rounded-[2px] border border-[#2A3040] text-phase-text-secondary text-[12px] font-mono hover:bg-phase-card transition-colors">Clear filters</button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1E2330] text-phase-text-secondary text-[10px] uppercase tracking-wider">
                {columns.map((col) => (
                  <th key={col.key} className={`px-4 py-2.5 font-medium ${col.sortable ? "cursor-pointer hover:text-phase-text transition-colors" : ""}`} onClick={col.sortable ? () => handleSort(col.key) : undefined}>
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon column={col.key} sortConfig={sortConfig} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => {
                const tier = suitabilityTier(s.suitability_score);
                const infra = parseInfrastructure(s.infrastructure);
                return (
                  <tr key={s.site_id} className="border-b border-[#1E2330] hover:bg-phase-card/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[13px] text-phase-text">{s.site_id}</td>
                    <td className="px-4 py-3">
                      <span className="text-[14px] text-phase-text">{s.name}</span>
                      <span className="text-[12px] text-phase-text-secondary ml-2">{s.district}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[14px] font-semibold text-phase-text">{s.suitability_score}</span>
                      <span className={`text-[11px] ml-1.5 ${tier.color}`}>{tier.label}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-phase-text-secondary">
                      {s.occupied.toLocaleString()} / {s.total_capacity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-phase-text">{s.available.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {INFRA_KEYS.map((infraKey) => (
                          <span key={infraKey.key} title={infraKey.label}>
                            <Icon
                              name={infra[infraKey.key] ? "check_circle" : "cancel"}
                              className={`text-[14px] ${infra[infraKey.key] ? "text-severity-green" : "text-phase-text-secondary/30"}`}
                            />
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Capacity link */}
      <div className="mt-4 flex justify-end">
        <a href="/capacity" className="text-[12px] font-mono text-phase-text-secondary hover:text-phase-text transition-colors flex items-center gap-1">
          View capacity overview
          <Icon name="arrow_forward" className="text-[14px]" />
        </a>
      </div>
    </main>
  );
}
