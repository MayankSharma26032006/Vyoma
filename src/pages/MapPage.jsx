import { useState, useMemo, useRef, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import GisMap from "../components/ui/GisMap.jsx";
import MapFilterButton from "../components/ui/MapFilterButton.jsx";
import Icon from "../components/ui/Icon.jsx";
import villageData from "../../mockData/habitations.json";

const FILTERS = [
  { key: "RED", label: "RED Risk", color: "bg-severity-red" },
  { key: "ORANGE", label: "ORANGE Risk", color: "bg-severity-amber" },
  { key: "GREEN", label: "GREEN Risk", color: "bg-severity-green" },
];

export default function MapPage() {
  const [activeRiskLevels, setActiveRiskLevels] = useState(
    new Set(["RED", "ORANGE", "GREEN"])
  );
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef(null);

  const districts = useMemo(() => {
    const set = new Set(villageData.map((v) => v.district));
    return ["All", ...Array.from(set).sort()];
  }, []);

  const toggleRisk = (level) => {
    setActiveRiskLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const handleSearch = useCallback(() => {
    if (!mapRef.current || !searchQuery.trim()) return;
    const q = searchQuery.trim().toLowerCase();
    const match = villageData.find((v) => v.name.toLowerCase().includes(q));
    if (match) {
      mapRef.current.flyTo({
        center: [match.longitude, match.latitude],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [searchQuery]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <main className="flex-1 overflow-hidden bg-phase-bg flex flex-col">
      {/* Page Header */}
      <div className="flex items-end justify-between border-b border-[#1E2330] pb-3 px-6 pt-6">
        <div>
          <h2 className="text-[20px] font-semibold text-phase-text">Hazard Map</h2>
          <p className="text-[13px] text-phase-text-secondary mt-1">
            Village-level risk visualization — Idukki district
          </p>
        </div>
      </div>

      {/* Full-page map with overlays */}
      <div className="flex-1 p-6 pt-4 relative">
        {/* Filter Controls — top-left */}
        <div className="absolute top-8 left-10 z-10 flex gap-2 flex-wrap">
          <div className="bg-surface-container/90 backdrop-blur-sm border border-border-subtle rounded-[4px] p-2 flex gap-2 shadow-xl">
            {FILTERS.map((f) => (
              <MapFilterButton
                key={f.key}
                label={f.label}
                color={f.color}
                active={activeRiskLevels.has(f.key)}
                onClick={() => toggleRisk(f.key)}
              />
            ))}
          </div>

          {/* District filter */}
          <div className="bg-surface-container/90 backdrop-blur-sm border border-border-subtle rounded-[4px] px-2 py-1 shadow-xl flex items-center gap-1.5">
            <Icon name="filter_list" className="text-[14px] text-on-surface-variant" />
            <select
              value={selectedDistrict || ""}
              onChange={(e) => setSelectedDistrict(e.target.value || null)}
              className="bg-transparent text-on-surface font-label-sm text-label-sm border-none outline-none cursor-pointer appearance-none pr-1"
            >
              {districts.map((d) => (
                <option key={d} value={d === "All" ? "" : d} className="bg-surface-container text-on-surface">
                  {d === "All" ? "All Districts" : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search — positioned left of zoom controls with safe margin */}
        <div className="absolute top-8 right-20 z-10 flex items-center gap-1 bg-surface-container/90 backdrop-blur-sm border border-border-subtle rounded-[4px] shadow-xl">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Icon name="search" className="text-[16px] text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="bg-transparent text-on-surface font-label-sm text-label-sm border-none outline-none w-[160px] placeholder:text-on-surface-variant/50"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-2 py-1.5 border-l border-border-subtle text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors rounded-r-[4px]"
          >
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>

        {/* Legend — bottom-left */}
        <div className="absolute bottom-8 left-10 z-10 bg-surface-container/90 backdrop-blur-sm border border-border-subtle rounded-[4px] p-3 shadow-xl">
          <h4 className="font-label-sm text-label-sm text-on-surface mb-2 uppercase tracking-wide">
            Legend
          </h4>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-severity-red/40 border border-severity-red rounded-[2px]" />
              <span className="font-label-sm text-label-sm text-on-surface-variant">RED Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-severity-amber/40 border border-severity-amber rounded-[2px]" />
              <span className="font-label-sm text-label-sm text-on-surface-variant">ORANGE Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-severity-green/40 border border-severity-green rounded-[2px]" />
              <span className="font-label-sm text-label-sm text-on-surface-variant">GREEN Risk</span>
            </div>
          </div>
        </div>

        <GisMap
          height="100%"
          className="rounded-[4px] border border-[#1E2330]"
          activeRiskLevels={activeRiskLevels}
          district={selectedDistrict}
          externalMapRef={mapRef}
        />
      </div>
    </main>
  );
}
