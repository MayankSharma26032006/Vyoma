/**
 * Relocation Site Capacity card.
 * Displays progress bars for each relocation site.
 * Capacity thresholds: <70% = green, 70-90% = amber, >90% = red
 */
import ProgressBar from "../ui/ProgressBar.jsx";

function capacityColor(pct) {
  if (pct >= 90) return "bg-severity-red";
  if (pct >= 70) return "bg-severity-amber";
  return "bg-severity-green";
}

const SITES = [
  { label: "Site R-17 (High Suitability)", percentage: 53 },
  { label: "Site R-08 (Medium Suitability)", percentage: 72 },
  { label: "Site R-22 (Under Dev)", percentage: 15 },
];

export default function RelocationSiteCapacity() {
  return (
    <div className="border border-border-subtle rounded-[4px] p-4 bg-surface-container-high">
      <h3 className="font-body-lg text-body-lg font-medium text-primary mb-4 border-b border-border-subtle pb-2">
        Relocation Site Capacity
      </h3>
      <div className="flex flex-col gap-4 font-label-md text-label-md">
        {SITES.map((site) => (
          <ProgressBar
            key={site.label}
            label={site.label}
            percentage={site.percentage}
            barColor={capacityColor(site.percentage)}
          />
        ))}
      </div>
    </div>
  );
}
