/**
 * Metrics row for the dashboard.
 * Displays 5 KPI stat cards in a responsive grid.
 */
import StatCard from "../ui/StatCard.jsx";

const STATS = [
  {
    label: "RED Risk Villages",
    value: "2",
    detail: "2 immediate",
    valueColor: "text-severity-red",
  },
  {
    label: "ORANGE Risk",
    value: "6",
    detail: "+1 this week",
    valueColor: "text-severity-amber",
  },
  {
    label: "Immediate Relocation",
    value: "1,420",
    detail: "pax",
    valueColor: "text-severity-red",
  },
  {
    label: "Suitable Sites",
    value: "08",
    detail: "verified",
    valueColor: "text-severity-green",
  },
  {
    label: "Population at Risk",
    value: "8.4k",
    detail: "total",
    valueColor: "text-primary",
  },
];

export default function StatsRow() {
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
