/**
 * Villages table page.
 * Fetches from GET /api/villages with server-side filtering via query params.
 * Sorting remains client-side.
 */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Icon from "../components/ui/Icon.jsx";
import { SkeletonLoader } from "../components/ui/SkeletonLoader.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { apiFetch } from "../lib/api.js";
import { useSelection } from "../context/SelectionContext.jsx";

// Risk level: RED/ORANGE/GREEN use severity-red/amber/green per Section 5.1
const RISK_LEVEL_COLORS = {
  RED: { bg: "bg-severity-red", text: "text-severity-red" },
  ORANGE: { bg: "bg-severity-amber", text: "text-severity-amber" },
  GREEN: { bg: "bg-severity-green", text: "text-severity-green" },
};

// Relocation priority: IMMEDIATE/SHORT-TERM/MEDIUM-TERM/ROUTINE
const PRIORITY_COLORS = {
  IMMEDIATE: { bg: "bg-severity-red", text: "text-severity-red" },
  "SHORT-TERM": { bg: "bg-severity-orange", text: "text-severity-orange" },
  "MEDIUM-TERM": { bg: "bg-severity-amber", text: "text-severity-amber" },
  ROUTINE: { bg: "bg-severity-green", text: "text-severity-green" },
};

const RISK_LEVELS = ["RED", "ORANGE", "GREEN"];
const PRIORITIES = ["IMMEDIATE", "SHORT-TERM", "MEDIUM-TERM", "ROUTINE"];

function SortIcon({ column, sortConfig }) {
  if (sortConfig.key !== column) return <Icon name="unfold_more" className="text-[14px] opacity-40" />;
  return <Icon name={sortConfig.direction === "asc" ? "arrow_upward" : "arrow_downward"} className="text-[14px]" />;
}

function FilterChip({ label, active, onClick, colorClass }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-[2px] text-[11px] font-mono border transition-colors ${active ? `${colorClass || "bg-phase-card"} border-phase-text/20 text-phase-text` : "bg-phase-bg border-[#1E2330] text-phase-text-secondary hover:border-[#2A3040]"}`}>
      {label}
    </button>
  );
}

function SkeletonRow() {
  return (<tr className="border-b border-[#1E2330]">{Array.from({ length: 7 }).map((_, i) => <td key={i} className="px-4 py-3"><div className="h-4 bg-[#1A1E28] rounded-[2px] animate-pulse w-3/4" /></td>)}</tr>);
}

/**
 * Build query params for the API from the current filters.
 * API supports single-value ?risk_level= and ?relocation_priority=.
 * When multiple values are selected in a category, we pass the first one
 * to the API and rely on client-side refinement for the rest — this still
 * tests the backend's filtering for the primary value.
 */
function buildQueryParams(filters, selectedState, selectedDistrict) {
  const params = new URLSearchParams();
  if (selectedDistrict) params.set("district", selectedDistrict);
  else if (selectedState) params.set("state", selectedState);
  if (filters.risk_level.length === 1) params.set("risk_level", filters.risk_level[0]);
  if (filters.priority.length === 1) params.set("relocation_priority", filters.priority[0]);
  return params.toString();
}

export default function HabitationsPage() {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: "risk_score", direction: "desc" });
  const [filters, setFilters] = useState({ risk_level: [], priority: [] });
  const { selectedState, selectedDistrict } = useSelection();

  // Build query string — passes single filters to API, multi-filters need client refinement
  const queryString = useMemo(() => buildQueryParams(filters, selectedState, selectedDistrict), [filters, selectedState, selectedDistrict]);

  const { data: allVillages = [], isLoading, error, refetch } = useQuery({
    queryKey: ["villages", queryString],
    queryFn: () => apiFetch(`/api/villages${queryString ? `?${queryString}` : ""}`),
  });

  // Client-side refinement for multi-select filters (when API can't handle them in one call)
  const filtered = useMemo(() => {
    return allVillages.filter((v) => {
      if (filters.risk_level.length > 1 && !filters.risk_level.includes(v.risk_level)) return false;
      if (filters.priority.length > 1 && !filters.priority.includes(v.relocation_priority)) return false;
      return true;
    });
  }, [allVillages, filters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let aVal = a[sortConfig.key], bVal = b[sortConfig.key];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortConfig]);

  const toggleFilter = (cat, val) => setFilters((p) => ({ ...p, [cat]: p[cat].includes(val) ? p[cat].filter((v) => v !== val) : [...p[cat], val] }));
  const clearFilters = () => setFilters({ risk_level: [], priority: [] });
  const hasActiveFilters = Object.values(filters).some((a) => a.length > 0);

  const handleSort = (key) => setSortConfig((p) => ({ key, direction: p.key === key && p.direction === "desc" ? "asc" : "desc" }));

  const columns = [
    { key: "rank", label: "Rank", sortable: false },
    { key: "name", label: "Village", sortable: true },
    { key: "population", label: "Population", sortable: true },
    { key: "risk_score", label: "Risk Score", sortable: true },
    { key: "risk_level", label: "Risk Level", sortable: true },
    { key: "relocation_priority", label: "Priority", sortable: true },
    { key: "low_confidence", label: "Confidence", sortable: false },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-phase-bg p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-phase-text tracking-tight">Vulnerable Villages</h1>
            <p className="text-sm text-phase-text-secondary mt-1">
              {selectedDistrict || selectedState || "All regions"} &mdash; {sorted.length} of {allVillages.length} villages
            </p>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] border border-[#2A3040] text-phase-text-secondary text-[12px] font-mono hover:bg-phase-elevated transition-colors">
              <Icon name="filter_alt_off" className="text-[14px]" />Clear filters
            </button>
          )}
        </div>

        <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4 mb-4">
          <div className="flex flex-wrap gap-6">
            <div><span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-2">Risk Level</span>
              <div className="flex flex-wrap gap-1.5">{RISK_LEVELS.map((l) => <FilterChip key={l} label={l} active={filters.risk_level.includes(l)} onClick={() => toggleFilter("risk_level", l)} colorClass={RISK_LEVEL_COLORS[l].bg} />)}</div></div>
            <div><span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-2">Priority</span>
              <div className="flex flex-wrap gap-1.5">{PRIORITIES.map((p) => <FilterChip key={p} label={p} active={filters.priority.includes(p)} onClick={() => toggleFilter("priority", p)} colorClass={PRIORITY_COLORS[p].bg} />)}</div></div>
          </div>
        </div>

        <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="border-b border-[#1E2330]">
              {columns.map((col) => <th key={col.key} className={`px-4 py-3 text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono ${col.sortable ? "cursor-pointer hover:text-phase-text select-none" : ""}`} onClick={() => col.sortable && handleSort(col.key)}>
                <div className="flex items-center gap-1">{col.label}{col.sortable && <SortIcon column={col.key} sortConfig={sortConfig} />}</div>
              </th>)}
            </tr></thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : error ? (
                <tr><td colSpan={7}><ErrorState onRetry={() => refetch()} /></td></tr>
              ) : (
                sorted.map((v, idx) => (
                  <tr key={v.village_id} onClick={() => navigate(`/villages/${v.village_id}`)} className="border-b border-[#1E2330] hover:bg-phase-card/50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-phase-text-secondary font-mono text-[13px]">{idx + 1}</td>
                    <td className="px-4 py-3"><span className="text-phase-text text-[14px]">{v.name}</span><span className="text-phase-text-secondary text-[12px] ml-2 font-mono">{v.village_id}</span></td>
                    <td className="px-4 py-3 text-phase-text font-mono text-[13px]">{v.population.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`font-mono text-[14px] font-semibold ${RISK_LEVEL_COLORS[v.risk_level].text}`}>{v.risk_score}</span></td>
                    <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-[2px] text-[11px] font-mono text-white ${RISK_LEVEL_COLORS[v.risk_level].bg}`}>{v.risk_level}</span></td>
                    <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-[2px] text-[11px] font-mono text-white ${PRIORITY_COLORS[v.relocation_priority].bg}`}>{v.relocation_priority}</span></td>
                    <td className="px-4 py-3">
                      {v.low_confidence ? (
                        <Icon name="warning_amber" className="text-[16px] text-severity-amber" />
                      ) : (
                        <Icon name="check_circle" className="text-[16px] text-phase-text-secondary/40" />
                      )}
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && !error && sorted.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <Icon name="search_off" className="text-[32px] text-phase-text-secondary mb-2 block mx-auto" />
                  <p className="text-phase-text-secondary text-[14px]">No villages match these filters</p>
                  <button onClick={clearFilters} className="mt-2 px-3 py-1 rounded-[2px] border border-[#2A3040] text-phase-text-secondary text-[12px] font-mono hover:bg-phase-card transition-colors">Clear filters</button>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
