/**
 * Relocation Site Capacity card.
 * Fetches sites from GET /api/sites and displays capacity bars.
 * Capacity thresholds: <70% = green, 70-90% = amber, >=90% = red
 */
import { useQuery } from "@tanstack/react-query";
import ProgressBar from "../ui/ProgressBar.jsx";
import { SkeletonBars } from "../ui/SkeletonLoader.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { apiFetch } from "../../lib/api.js";

function capacityColor(pct) {
  if (pct >= 90) return "bg-severity-red";
  if (pct >= 70) return "bg-severity-amber";
  return "bg-severity-green";
}

export default function RelocationSiteCapacity() {
  const { data: sites, isLoading, error, refetch } = useQuery({
    queryKey: ["sites"],
    queryFn: () => apiFetch("/api/sites"),
  });

  return (
    <div className="border border-border-subtle rounded-[4px] p-4 bg-surface-container-high">
      <h3 className="font-body-lg text-body-lg font-medium text-primary mb-4 border-b border-border-subtle pb-2">
        Relocation Site Capacity
      </h3>
      <div className="flex flex-col gap-4 font-label-md text-label-md">
        {isLoading ? (
          <SkeletonBars count={3} />
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          sites?.map((site) => {
            const pct = Math.round((site.occupied / site.total_capacity) * 100);
            return (
              <ProgressBar
                key={site.site_id}
                label={`${site.name} (${pct}%)`}
                percentage={pct}
                barColor={capacityColor(pct)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
