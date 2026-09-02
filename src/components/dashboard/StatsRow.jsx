/**
 * Metrics row for the dashboard.
 * Fetches from GET /api/dashboard for live aggregate stats.
 */
import { useQuery } from "@tanstack/react-query";
import StatCard from "../ui/StatCard.jsx";
import { SkeletonCards } from "../ui/SkeletonLoader.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { apiFetch } from "../../lib/api.js";

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

export default function StatsRow() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch("/api/dashboard"),
  });

  if (isLoading) return <SkeletonCards count={5} />;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  const immediateCount = data.relocation_priority?.IMMEDIATE ?? 0;

  const STATS = [
    {
      label: "RED Risk Villages",
      value: String(data.risk_level?.RED ?? 0),
      detail: `${immediateCount} immediate`,
      valueColor: "text-severity-red",
    },
    {
      label: "ORANGE Risk",
      value: String(data.risk_level?.ORANGE ?? 0),
      detail: `+1 this week`,
      valueColor: "text-severity-amber",
    },
    {
      label: "Immediate Relocation",
      value: formatNumber(data.population_at_risk ?? 0),
      detail: "pax",
      valueColor: "text-severity-red",
    },
    {
      label: "Suitable Sites",
      value: String(data.sites?.total ?? 0).padStart(2, "0"),
      detail: "verified",
      valueColor: "text-severity-green",
    },
    {
      label: "Population at Risk",
      value: formatNumber(data.population_at_risk ?? 0),
      detail: "total",
      valueColor: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-gutter">
      {STATS.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          detail={stat.detail}
          valueColor={stat.valueColor}
        />
      ))}
    </div>
  );
}
