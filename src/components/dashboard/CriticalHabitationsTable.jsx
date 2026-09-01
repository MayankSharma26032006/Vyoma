/**
 * Critical Habitations side panel.
 * Displays a scrollable table of high-risk villages with scores and population.
 */
import { useState } from "react";
import Icon from "../ui/Icon.jsx";

const SEVERITY_COLORS = {
  RED: "text-severity-red",
  ORANGE: "text-severity-amber",
  GREEN: "text-severity-green",
};

const HABITATIONS = [
  { village: "Kunchithanny", score: 0.91, population: "1,240", risk_level: "RED" },
  { village: "Edamalakudy", score: 0.87, population: "850", risk_level: "RED" },
  { village: "Vagapparai", score: 0.78, population: "420", risk_level: "ORANGE" },
  { village: "Panchali Medu", score: 0.72, population: "2,100", risk_level: "ORANGE" },
  { village: "Chempakapara", score: 0.68, population: "340", risk_level: "ORANGE" },
  { village: "Petti Mundakkayam", score: 0.64, population: "980", risk_level: "ORANGE" },
];

export default function CriticalHabitationsTable() {
  const [selectedVillage, setSelectedVillage] = useState(null);

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
                <td className={`px-3 py-2 text-center font-bold font-mono ${SEVERITY_COLORS[row.risk_level]}`}>
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
