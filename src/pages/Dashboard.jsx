/**
 * Dashboard page matching the exact Stitch design.
 * Composes all dashboard sections: header, stats, map+table, bottom row.
 */
import Icon from "../components/ui/Icon.jsx";
import StatsRow from "../components/dashboard/StatsRow.jsx";
import MapPanel from "../components/dashboard/MapPanel.jsx";
import CriticalHabitationsTable from "../components/dashboard/CriticalHabitationsTable.jsx";
import RelocationPrioritySummary from "../components/dashboard/RelocationPrioritySummary.jsx";
import RelocationSiteCapacity from "../components/dashboard/RelocationSiteCapacity.jsx";
import { useSelection } from "../context/SelectionContext.jsx";

export default function Dashboard() {
  const { selectedState, selectedDistrict } = useSelection();
  const regionLabel = selectedDistrict || selectedState || "Selected State / Selected District";
  return (
    <main className="flex-1 overflow-y-auto p-margin-page flex flex-col gap-stack-lg bg-surface-lowest">
      {/* 1. Header Section */}
      <div className="flex items-end justify-between border-b border-border-subtle pb-stack-sm">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">
            District Overview
          </h2>
          <p className="font-label-md text-label-md text-on-surface-variant mt-1">
            {regionLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant bg-surface-base px-3 py-1 border border-border-subtle rounded-[2px]">
          <Icon name="sync" className="text-[14px]" />
          <span className="font-label-sm text-label-sm">Last updated: 14:30</span>
        </div>
      </div>

      {/* 2. Metrics Row */}
      <StatsRow />

      {/* 3 & 4. Map + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter h-[600px]">
        <MapPanel />
        <CriticalHabitationsTable />
      </div>

      {/* 5. Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter pb-margin-page">
        <RelocationPrioritySummary />
        <RelocationSiteCapacity />
      </div>
    </main>
  );
}
