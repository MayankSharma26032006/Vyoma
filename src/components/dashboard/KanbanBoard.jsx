import { useState } from "react";
import KanbanCard from "../ui/KanbanCard.jsx";
import Icon from "../ui/Icon.jsx";

const LANES = [
  {
    key: "IMMEDIATE",
    label: "IMMEDIATE",
    headerColor: "bg-severity-red",
    headerText: "text-white",
  },
  {
    key: "SHORT-TERM",
    label: "SHORT-TERM",
    headerColor: "bg-severity-orange",
    headerText: "text-white",
  },
  {
    key: "MEDIUM-TERM",
    label: "MEDIUM-TERM",
    headerColor: "bg-severity-amber",
    headerText: "text-white",
  },
  {
    key: "ROUTINE",
    label: "ROUTINE",
    headerColor: "bg-severity-green",
    headerText: "text-white",
    collapsedByDefault: true,
  },
];

export default function KanbanBoard({ villages }) {
  const [collapsed, setCollapsed] = useState(() => {
    const initial = {};
    LANES.forEach((lane) => {
      if (lane.collapsedByDefault) initial[lane.key] = true;
    });
    return initial;
  });

  const grouped = {};
  LANES.forEach((lane) => {
    grouped[lane.key] = villages.filter(
      (v) => v.relocation_priority === lane.key
    );
  });

  function toggleLane(key) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-4">
      {LANES.map((lane) => {
        const items = grouped[lane.key];
        const isCollapsed = !!collapsed[lane.key];
        const count = items.length;

        return (
          <div key={lane.key} className="flex flex-col">
            {/* Lane Header */}
            <button
              onClick={() => toggleLane(lane.key)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-t-[4px] ${lane.headerColor} cursor-pointer transition-colors`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-[13px] font-mono font-semibold ${lane.headerText} uppercase tracking-wider`}>
                  {lane.label}
                </span>
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-[2px] bg-black/30 text-[11px] font-mono font-bold text-white">
                  {count}
                </span>
              </div>
              <Icon
                name={isCollapsed ? "expand_more" : "expand_less"}
                className={`text-[18px] ${lane.headerText}`}
              />
            </button>

            {/* Lane Body */}
            {!isCollapsed && (
              <div className="bg-phase-elevated border border-[#1E2330] border-t-0 rounded-b-[4px] p-3 min-h-[80px]">
                {count === 0 ? (
                  <div className="flex items-center justify-center h-16">
                    <span className="text-[13px] text-phase-text-secondary">
                      No villages in this priority tier
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {items.map((v) => (
                      <KanbanCard key={v.village_id} village={v} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
