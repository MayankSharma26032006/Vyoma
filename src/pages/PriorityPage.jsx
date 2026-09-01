import KanbanBoard from "../components/dashboard/KanbanBoard.jsx";
import villageData from "../../mockData/habitations.json";

export default function PriorityPage() {
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
            {villageData.length} villages
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard villages={villageData} />
    </main>
  );
}
