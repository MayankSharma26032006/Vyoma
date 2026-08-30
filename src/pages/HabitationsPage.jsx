import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/ui/Icon.jsx";
import habitationData from "../../mockData/habitations.json";

const SEVERITY_COLORS = { critical: "bg-severity-red", high: "bg-severity-orange", medium: "bg-severity-amber", low: "bg-severity-green" };
const SEVERITY_TEXT = { critical: "text-severity-red", high: "text-severity-orange", medium: "text-severity-amber", low: "text-severity-green" };
const HAZARD_COLORS = { flood: "bg-hazard-flood", landslide: "bg-hazard-landslide", earthquake: "bg-hazard-earthquake", cyclone: "bg-hazard-cyclone" };
const BLOCKS = [...new Set(habitationData.map((h) => h.block))].sort();
const RISK_LEVELS = ["critical", "high", "medium", "low"];
const PRIORITIES = ["immediate", "short-term", "medium-term"];
const HAZARD_TYPES = ["flood", "landslide", "earthquake", "cyclone"];

function SortIcon({ column, sortConfig }) {
  if (sortConfig.key !== column) return <Icon name="unfold_more" className="text-[14px] opacity-40" />;
  return <Icon name={sortConfig.direction === "asc" ? "arrow_upward" : "arrow_downward"} className="text-[14px]" />;
}

function FilterChip({ label, active, onClick, colorClass }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded text-[11px] font-mono border transition-colors ${active ? `${colorClass || "bg-phase-card"} border-phase-text/20 text-phase-text` : "bg-phase-bg border-[#1E2330] text-phase-text-secondary hover:border-[#2A3040]"}`}>
      {label}
    </button>
  );
}

function SkeletonRow() {
  return (<tr className="border-b border-[#1E2330]">{Array.from({ length: 6 }).map((_, i) => <td key={i} className="px-4 py-3"><div className="h-4 bg-[#1A1E28] rounded animate-pulse w-3/4" /></td>)}</tr>);
}

export default function HabitationsPage() {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: "risk_score", direction: "desc" });
  const [filters, setFilters] = useState({ hazard_type: [], risk_level: [], priority: [], block: [] });
  const [isLoading] = useState(false);

  const toggleFilter = (cat, val) => setFilters(p => ({ ...p, [cat]: p[cat].includes(val) ? p[cat].filter(v => v !== val) : [...p[cat], val] }));
  const clearFilters = () => setFilters({ hazard_type: [], risk_level: [], priority: [], block: [] });
  const hasActiveFilters = Object.values(filters).some(a => a.length > 0);

  const filtered = useMemo(() => habitationData.filter(h => {
    if (filters.hazard_type.length > 0 && !filters.hazard_type.some(t => h.hazard_types.includes(t))) return false;
    if (filters.risk_level.length > 0 && !filters.risk_level.includes(h.risk_level)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(h.priority)) return false;
    if (filters.block.length > 0 && !filters.block.includes(h.block)) return false;
    return true;
  }), [filters]);

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

  const handleSort = (key) => setSortConfig(p => ({ key, direction: p.key === key && p.direction === "desc" ? "asc" : "desc" }));

  const columns = [
    { key: "rank", label: "Rank", sortable: false },
    { key: "name", label: "Habitation", sortable: true },
    { key: "population", label: "Population", sortable: true },
    { key: "risk_score", label: "Risk Score", sortable: true },
    { key: "risk_level", label: "Risk Level", sortable: true },
    { key: "priority", label: "Priority", sortable: true },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-phase-bg p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-phase-text tracking-tight">Vulnerable Habitations</h1>
            <p className="text-sm text-phase-text-secondary mt-1">Idukki District &mdash; {sorted.length} of {habitationData.length} habitations</p>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#2A3040] text-phase-text-secondary text-[12px] font-mono hover:bg-phase-elevated transition-colors">
              <Icon name="filter_alt_off" className="text-[14px]" />Clear filters
            </button>
          )}
        </div>

        <div className="bg-phase-elevated rounded border border-[#1E2330] p-4 mb-4">
          <div className="flex flex-wrap gap-6">
            <div><span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-2">Hazard Type</span>
              <div className="flex flex-wrap gap-1.5">{HAZARD_TYPES.map(t => <FilterChip key={t} label={t} active={filters.hazard_type.includes(t)} onClick={() => toggleFilter("hazard_type", t)} colorClass={HAZARD_COLORS[t]} />)}</div></div>
            <div><span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-2">Risk Level</span>
              <div className="flex flex-wrap gap-1.5">{RISK_LEVELS.map(l => <FilterChip key={l} label={l} active={filters.risk_level.includes(l)} onClick={() => toggleFilter("risk_level", l)} colorClass={SEVERITY_COLORS[l]} />)}</div></div>
            <div><span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-2">Priority</span>
              <div className="flex flex-wrap gap-1.5">{PRIORITIES.map(p => <FilterChip key={p} label={p} active={filters.priority.includes(p)} onClick={() => toggleFilter("priority", p)} />)}</div></div>
            <div><span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-2">Block</span>
              <div className="flex flex-wrap gap-1.5">{BLOCKS.map(b => <FilterChip key={b} label={b} active={filters.block.includes(b)} onClick={() => toggleFilter("block", b)} />)}</div></div>
          </div>
        </div>

        <div className="bg-phase-elevated rounded border border-[#1E2330] overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="border-b border-[#1E2330]">
              {columns.map(col => <th key={col.key} className={`px-4 py-3 text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono ${col.sortable ? "cursor-pointer hover:text-phase-text select-none" : ""}`} onClick={() => col.sortable && handleSort(col.key)}>
                <div className="flex items-center gap-1">{col.label}{col.sortable && <SortIcon column={col.key} sortConfig={sortConfig} />}</div>
              </th>)}
            </tr></thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />) : sorted.map((hab, idx) => (
                <tr key={hab.id} onClick={() => navigate(`/habitations/${hab.id}`)} className="border-b border-[#1E2330] hover:bg-phase-card/50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-phase-text-secondary font-mono text-[13px]">{idx + 1}</td>
                  <td className="px-4 py-3"><span className="text-phase-text text-[14px]">{hab.name}</span><span className="text-phase-text-secondary text-[12px] ml-2 font-mono">{hab.id}</span></td>
                  <td className="px-4 py-3 text-phase-text font-mono text-[13px]">{hab.population.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`font-mono text-[14px] font-semibold ${SEVERITY_TEXT[hab.risk_level]}`}>{hab.risk_score}</span></td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono text-white ${SEVERITY_COLORS[hab.risk_level]}`}>{hab.risk_level}</span></td>
                  <td className="px-4 py-3"><span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono text-phase-text bg-[#1A1E28] border border-[#1E2330]">{hab.priority}</span></td>
                </tr>
              ))}
              {!isLoading && sorted.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center">
                <Icon name="search_off" className="text-[32px] text-phase-text-secondary mb-2 block mx-auto" />
                <p className="text-phase-text-secondary text-[14px]">No habitations match these filters</p>
                <button onClick={clearFilters} className="mt-2 px-3 py-1 rounded border border-[#2A3040] text-phase-text-secondary text-[12px] font-mono hover:bg-phase-card transition-colors">Clear filters</button>
              </td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
