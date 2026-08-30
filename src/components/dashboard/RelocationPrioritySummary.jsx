/**
 * Relocation Priority Summary card matching the exact Stitch design.
 * Displays immediate, short-term, and medium-term relocation counts.
 */

const PRIORITIES = [
  { label: "Immediate", value: "12", color: "text-severity-red" },
  { label: "Short-term", value: "34", color: "text-severity-orange" },
  { label: "Med-term", value: "89", color: "text-severity-amber" },
];

export default function RelocationPrioritySummary() {
  return (
    <div className="border border-border-subtle rounded-lg p-4 bg-surface-container-high">
      <h3 className="font-body-lg text-body-lg font-medium text-primary mb-4 border-b border-border-subtle pb-2">
        Relocation Priority Summary
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {PRIORITIES.map((item) => (
          <div
            key={item.label}
            className="bg-surface-raised border border-border-subtle rounded p-3 flex flex-col items-center justify-center text-center"
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
