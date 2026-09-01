/**
 * Map filter toggle button.
 * Used in the map overlay for risk-level toggles.
 */
export default function MapFilterButton({ label, color, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 ${
        active ? "bg-surface-raised" : "bg-surface-lowest"
      } border border-border-subtle rounded-[2px] font-label-sm text-label-sm ${
        active ? "text-primary" : "text-on-surface-variant"
      } hover:bg-surface-container transition-colors flex items-center gap-2`}
    >
      <div className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </button>
  );
}
