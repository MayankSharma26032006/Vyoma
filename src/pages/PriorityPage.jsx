/**
 * Relocation Priority kanban page.
 * Fetches villages from GET /api/villages, groups into 4 lanes client-side.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import KanbanBoard from "../components/dashboard/KanbanBoard.jsx";
import { SkeletonLoader } from "../components/ui/SkeletonLoader.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import { apiFetch } from "../lib/api.js";
import { useSelection } from "../context/SelectionContext.jsx";

export default function PriorityPage() {
  const { selectedState, selectedDistrict } = useSelection();

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedDistrict) params.set("district", selectedDistrict);
    else if (selectedState) params.set("state", selectedState);
    return params.toString();
  }, [selectedState, selectedDistrict]);

  const { data: villages = [], isLoading, error, refetch } = useQuery({
    queryKey: ["villages", queryParams],
    queryFn: () => apiFetch(`/api/villages${queryParams ? `?${queryParams}` : ""}`),
  });

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
            {isLoading ? "..." : `${villages.length} villages`}
          </span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {["IMMEDIATE", "SHORT-TERM", "MEDIUM-TERM", "ROUTINE"].map((lane) => (
            <div key={lane}>
              <div className={`h-10 rounded-t-[4px] animate-pulse ${
                lane === "IMMEDIATE" ? "bg-severity-red/30" :
                lane === "SHORT-TERM" ? "bg-severity-orange/30" :
                lane === "MEDIUM-TERM" ? "bg-severity-amber/30" :
                "bg-severity-green/30"
              }`} />
              <div className="bg-phase-elevated border border-[#1E2330] border-t-0 rounded-b-[4px] p-3">
                <SkeletonLoader rows={2} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <KanbanBoard villages={villages} />
      )}
    </main>
  );
}
