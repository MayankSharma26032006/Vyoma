/**
 * Critical Habitations side panel.
 * Fetches villages from GET /api/villages and shows the top 6 by risk_score.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Icon from "../ui/Icon.jsx";
import { SkeletonLoader } from "../ui/SkeletonLoader.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { apiFetch } from "../../lib/api.js";

const SEVERITY_COLORS = {
  RED: "text-severity-red",
  ORANGE: "text-severity-amber",
  GREEN: "text-severity-green",
};

export default function CriticalHabitationsTable() {
  const [selectedVillage, setSelectedVillage] = useState(null);
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["villages"],
    queryFn: () => apiFetch("/api/villages"),
  });

  return (
    <div className="bg-surface-base border border-border-subtle rounded-[4px] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle bg-surface-raised">
        <h3 className="font-body-lg text-body-lg font-medium text-primary flex items-center gap-2">
          <Icon name="warning" className="text-severity-red" />
          Critical Habitations
        </h3>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3">
            <SkeletonLoader rows={6} />
          </div>
        ) : error ? (
          <div className="p-3">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : (
          <table className="w-full text-left font-label-md text-label-md">
            <thead className="sticky top-0 bg-surface-container-high border-b border-border-subtle text-on-surface-variant text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 font-medium">Village</th>
                <th className="px-3 py-2 font-medium text-center">Score</th>
                <th className="px-3 py-2 font-medium text-right">Pop.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {data?.slice(0, 6).map((v) => (
                <tr
                  key={v.village_id}
                  onClick={() => navigate(`/villages/${v.village_id}`)}
                  className={`hover:bg-surface-variant transition-colors cursor-pointer ${
                    selectedVillage === v.village_id ? "bg-surface-variant" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-primary">{v.name}</td>
                  <td className={`px-3 py-2 text-center font-bold font-mono ${SEVERITY_COLORS[v.risk_level]}`}>
                    {v.risk_score}
                  </td>
                  <td className="px-3 py-2 text-right">{v.population.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
