import { useNavigate } from "react-router-dom";

const RISK_BADGE_COLORS = {
  RED: "bg-severity-red",
  ORANGE: "bg-severity-amber",
  GREEN: "bg-severity-green",
};

export default function KanbanCard({ village }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/villages/${village.village_id}`)}
      className="w-full text-left bg-phase-card rounded-[4px] border border-[#1E2330] p-3 hover:border-[#2A3040] transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[13px] text-phase-text font-medium leading-tight">
          {village.name}
        </span>
        <span
          className={`inline-block px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono font-semibold text-white shrink-0 ${RISK_BADGE_COLORS[village.risk_level]}`}
        >
          {village.risk_level}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[14px] font-mono font-semibold text-phase-text">
          {village.risk_score}
        </span>
        <span className="text-[12px] font-mono text-phase-text-secondary">
          {village.population.toLocaleString()} pop.
        </span>
      </div>
    </button>
  );
}
