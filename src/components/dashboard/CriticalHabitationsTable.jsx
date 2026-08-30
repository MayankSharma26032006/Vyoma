/**
 * Critical Habitations side panel matching the exact Stitch design.
 * Displays a scrollable table of high-risk villages with scores and population.
 */
import { useState } from "react";
import Icon from "../ui/Icon.jsx";

const SEVERITY_COLORS = {
  critical: "text-severity-red",
  high: "text-severity-orange",
  medium: "text-severity-amber",
  low: "text-severity-green",
};

const HABITATIONS = [
  { village: "Village A", score: 91, population: "1,240", severity: "critical" },
  { village: "Settlement B", score: 87, population: "850", severity: "critical" },
  { village: "Hamlet C", score: 82, population: "420", severity: "high" },
  { village: "Village D", score: 78, population: "2,100", severity: "high" },
  { village: "Colony E", score: 75, population: "340", severity: "high" },
  { village: "Village F", score: 71, population: "980", severity: "high" },
];

export default function CriticalHabitationsTable() {
  const [selectedVillage, setSelectedVillage] = useState(null);

  return (
    <div className="bg-surface-base border border-border-subtle rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle bg-surface-raised">
        <h3 className="font-body-lg text-body-lg font-medium text-primary flex items-center gap-2">
          <Icon name="warning" className="text-severity-red" />
          Critical Habitations
        </h3>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left font-label-md text-label-md">
          <thead className="sticky top-0 bg-surface-container-high border-b border-border-subtle text-on-surface-variant text-[10px] uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2 font-medium">Village</th>
              <th className="px-3 py-2 font-medium text-center">Score</th>
              <th className="px-3 py-2 font-medium text-right">Pop.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {HABITATIONS.map((row) => (
              <tr
                key={row.village}
                onClick={() => setSelectedVillage(row.village)}
                className={`hover:bg-surface-variant transition-colors cursor-pointer ${
                  selectedVillage === row.village ? "bg-surface-variant" : ""
                }`}
              >
                <td className="px-3 py-2 text-primary">{row.village}</td>
                <td className={`px-3 py-2 text-center font-bold ${SEVERITY_COLORS[row.severity]}`}>
                  {row.score}
                </td>
                <td className="px-3 py-2 text-right">{row.population}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
