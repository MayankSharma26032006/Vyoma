/**
 * Metric stat card.
 * Used in the 5-column metrics row on the dashboard.
 */
export default function StatCard({ label, value, detail, valueColor = "text-primary" }) {
  return (
    <div className="bg-surface-container-high border border-border-subtle p-3 flex flex-col rounded-[4px]">
      <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
        <span className="text-[10px] text-on-surface-variant">{detail}</span>
      </div>
    </div>
  );
}
