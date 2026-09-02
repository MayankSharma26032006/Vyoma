/**
 * Relocation Priority Summary card.
 * Fetches from GET /api/dashboard for priority tier counts.
 */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api.js";

export default function RelocationPrioritySummary() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch("/api/dashboard"),
  });

  if (isLoading) {
    return (
      <div className="border border-border-subtle rounded-[4px] p-4 bg-surface-container-high animate-pulse">
        <div className="h-5 w-56 bg-surface-container-high rounded-[2px] mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface-container-high rounded-[2px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-border-subtle rounded-[4px] p-4 bg-surface-container-high">
        <h3 className="font-body-lg text-body-lg font-medium text-primary mb-4 border-b border-border-subtle pb-2">
          Relocation Priority Summary
        </h3>
        <p className="text-on-surface-variant text-body-md text-center py-4">Unable to load data</p>
      </div>
    );
  }

  const p = data.relocation_priority || {};
  const PRIORITIES = [
    { label: "Immediate", value: String(p.IMMEDIATE ?? 0), color: "text-severity-red" },
    { label: "Short-term", value: String(p["SHORT-TERM"] ?? 0), color: "text-severity-orange" },
    { label: "Med-term", value: String(p["MEDIUM-TERM"] ?? 0), color: "text-severity-amber" },
  ];

  return (
    <div className="border border-border-subtle rounded-[4px] p-4 bg-surface-container-high">
      <h3 className="font-body-lg text-body-lg font-medium text-primary mb-4 border-b border-border-subtle pb-2">
        Relocation Priority Summary
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {PRIORITIES.map((item) => (
          <div
            key={item.label}
            className="bg-surface-raised border border-border-subtle rounded-[2px] p-3 flex flex-col items-center justify-center text-center"
          >
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">
              {item.label}
            </span>
            <span className={`font-headline-lg text-headline-lg ${item.color}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
