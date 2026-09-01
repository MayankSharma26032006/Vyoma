/**
 * Progress bar.
 * Used in RelocationSiteCapacity to show site utilization.
 */
export default function ProgressBar({ label, percentage, barColor = "bg-severity-green" }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-primary">{label}</span>
        <span className="text-on-surface-variant">{percentage}%</span>
      </div>
      <div className="w-full bg-surface-container rounded-[2px] h-2 overflow-hidden border border-border-subtle">
        <div
          className={`${barColor} h-2 rounded-[2px]`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
