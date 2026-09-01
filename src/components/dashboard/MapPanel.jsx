/**
 * GIS Map panel for the Dashboard.
 * Embedded MapLibre map with risk-level toggles, district filter, zoom controls, and legend.
 */
import { useState, useMemo } from "react";
import MapFilterButton from "../ui/MapFilterButton.jsx";
import Icon from "../ui/Icon.jsx";
import GisMap from "../ui/GisMap.jsx";
import villageData from "../../../mockData/habitations.json";

const FILTERS = [
  { key: "RED", label: "RED Risk", color: "bg-severity-red" },
  { key: "ORANGE", label: "ORANGE Risk", color: "bg-severity-amber" },
  { key: "GREEN", label: "GREEN Risk", color: "bg-severity-green" },
];

export default function MapPanel() {
  const [activeRiskLevels, setActiveRiskLevels] = useState(
    new Set(["RED", "ORANGE", "GREEN"])
  );
  const [selectedDistrict, setSelectedDistrict] = useState(null);

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

  return (
    <div className="lg:col-span-3 bg-surface-base border border-border-subtle rounded-[4px] relative overflow-hidden flex flex-col">
      {/* Filter Controls — constrained width to avoid overlapping zoom controls at top-right */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap max-w-[calc(100%-80px)]">
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

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-surface-container/90 backdrop-blur-sm border border-border-subtle rounded-[4px] p-3 shadow-xl">
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

      {/* Map */}
      <GisMap height="100%" activeRiskLevels={activeRiskLevels} district={selectedDistrict} />
    </div>
  );
}
