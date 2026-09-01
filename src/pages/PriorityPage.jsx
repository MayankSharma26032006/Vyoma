import { useMemo } from "react";
import KanbanBoard from "../components/dashboard/KanbanBoard.jsx";
import villageData from "../../mockData/habitations.json";
import { useSelection } from "../context/SelectionContext.jsx";

export default function PriorityPage() {
  const { selectedState, selectedDistrict } = useSelection();
  const filteredVillages = useMemo(() => villageData.filter(v => {
    if (selectedState && v.state !== selectedState) return false;
    if (selectedDistrict && v.district !== selectedDistrict) return false;
    return true;
  }), [selectedState, selectedDistrict]);

  return (
    <main className="flex-1 overflow-y-auto bg-phase-bg p-6">
      {/* Page Header */}
      <div className="flex items-end justify-between border-b border-[#1E2330] pb-3 mb-6">
        <div>
          <h2 className="text-[20px] font-semibold text-phase-text">
            Relocation Priority
          </h2>
          <p className="text-[13px] text-phase-text-secondary mt-1">
            Villages ranked by relocation urgency
          </p>
        </div>
        <div className="flex items-center gap-2 text-phase-text-secondary bg-phase-elevated px-3 py-1 border border-[#1E2330] rounded-[2px]">
          <span className="text-[12px] font-mono">
            {filteredVillages.length} villages
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard villages={filteredVillages} />
    </main>
  );
}
