import { useParams, Link } from "react-router-dom";
import Icon from "../components/ui/Icon.jsx";
import villageData from "../../mockData/habitations.json";

// Risk level: RED/ORANGE/GREEN
const RISK_LEVEL_COLORS = {
  RED: { bg: "bg-severity-red", text: "text-severity-red" },
  ORANGE: { bg: "bg-severity-amber", text: "text-severity-amber" },
  GREEN: { bg: "bg-severity-green", text: "text-severity-green" },
};

// Relocation priority
const PRIORITY_COLORS = {
  IMMEDIATE: { bg: "bg-severity-red", text: "text-severity-red" },
  "SHORT-TERM": { bg: "bg-severity-orange", text: "text-severity-orange" },
  "MEDIUM-TERM": { bg: "bg-severity-amber", text: "text-severity-amber" },
  ROUTINE: { bg: "bg-severity-green", text: "text-severity-green" },
};

// Impact badge colors: high/medium get colored bg + white text, low gets neutral border only
const IMPACT_COLORS = {
  high: "text-white bg-severity-red",
  medium: "text-white bg-severity-amber",
  low: "text-phase-text-secondary border border-[#2A3040]",
};

function MiniMapPlaceholder({ name }) {
  return (
    <div className="bg-phase-card rounded-[4px] border border-[#1E2330] h-[180px] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-16 h-16 border border-phase-text-secondary/20 rounded-[2px]" />
        <div className="absolute bottom-6 right-6 w-24 h-12 border border-phase-text-secondary/20 rounded-[2px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-severity-red rounded-full" />
      </div>
      <Icon name="map" className="text-[28px] text-phase-text-secondary/40 mb-1" />
      <span className="text-[11px] font-mono text-phase-text-secondary/60">{name}</span>
      <span className="text-[10px] text-phase-text-secondary/40 mt-0.5">Interactive map coming soon</span>
    </div>
  );
}

function TopFactorsList({ factors }) {
  if (!factors || factors.length === 0) return null;
  return (
    <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4">
      <h3 className="text-[13px] font-semibold text-phase-text mb-3 flex items-center gap-2">
        <Icon name="analytics" className="text-[16px] text-phase-text-secondary" />Top Contributing Factors
      </h3>
      <div className="space-y-2">
        {factors.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[12px] font-mono text-phase-text-secondary w-[16px] shrink-0">{i + 1}.</span>
            <span className="text-[13px] text-phase-text flex-1">{f.feature}</span>
            <span className="text-[12px] font-mono text-phase-text-secondary">{f.value}</span>
            <span className={`inline-block px-2 py-0.5 rounded-[2px] text-[10px] font-mono ${IMPACT_COLORS[f.impact]}`}>{f.impact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LowConfidenceBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-[2px] bg-severity-amber/10 border border-severity-amber/30 mt-2">
      <Icon name="warning_amber" className="text-[14px] text-severity-amber shrink-0" />
      <span className="text-[12px] font-mono text-severity-amber">Low confidence &mdash; limited training data</span>
    </div>
  );
}

export default function HabitationDetailPage() {
  const { id } = useParams();
  const hab = villageData.find(v => v.village_id === id);

  if (!hab) {
    return (
      <main className="flex-1 overflow-y-auto bg-phase-bg p-6 flex items-center justify-center">
        <div className="text-center">
          <Icon name="error_outline" className="text-[48px] text-phase-text-secondary mb-3 block mx-auto" />
          <h2 className="text-lg text-phase-text mb-1">Village not found</h2>
          <p className="text-sm text-phase-text-secondary mb-4">No village matches ID: {id}</p>
          <Link to="/habitations" className="px-4 py-2 rounded-[2px] border border-[#2A3040] text-phase-text-secondary text-[13px] font-mono hover:bg-phase-elevated transition-colors">Back to Villages</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-phase-bg p-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Breadcrumb + Header */}
        <div className="mb-6">
          <Link to="/habitations" className="inline-flex items-center gap-1 text-[12px] font-mono text-phase-text-secondary hover:text-phase-text transition-colors mb-3">
            <Icon name="arrow_back" className="text-[14px]" />Villages
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-phase-text tracking-tight">{hab.name}</h1>
              <p className="text-sm text-phase-text-secondary mt-1 font-mono">{hab.village_id}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2.5 py-1 rounded-[2px] text-[11px] font-mono text-white ${RISK_LEVEL_COLORS[hab.risk_level].bg}`}>{hab.risk_level}</span>
              <span className={`inline-block px-2.5 py-1 rounded-[2px] text-[11px] font-mono text-white ${PRIORITY_COLORS[hab.relocation_priority].bg}`}>{hab.relocation_priority}</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">
            <MiniMapPlaceholder name={hab.name} />

            {/* Location */}
            <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4">
              <h3 className="text-[13px] font-semibold text-phase-text mb-3 flex items-center gap-2">
                <Icon name="location_on" className="text-[16px] text-phase-text-secondary" />Location
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Village</span><span className="text-[13px] text-phase-text">{hab.name}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Coordinates</span><span className="text-[13px] text-phase-text font-mono">{hab.latitude.toFixed(4)}, {hab.longitude.toFixed(4)}</span></div>
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4">
              <h3 className="text-[13px] font-semibold text-phase-text mb-3 flex items-center gap-2">
                <Icon name="groups" className="text-[16px] text-phase-text-secondary" />Demographics
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Population</span><span className="text-[13px] text-phase-text font-mono">{hab.population.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Households</span><span className="text-[13px] text-phase-text font-mono">{hab.households.toLocaleString()}</span></div>
              </div>
            </div>

            {/* Recommended Site */}
            <div className={`bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4 ${hab.recommended_site_id ? "cursor-pointer hover:border-[#2A3040] transition-colors" : ""}`}>
              <h3 className="text-[13px] font-semibold text-phase-text mb-3 flex items-center gap-2">
                <Icon name="location_city" className="text-[16px] text-phase-text-secondary" />Recommended Site
              </h3>
              {hab.recommended_site_id ? (
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Site</span><span className="text-[13px] text-phase-text">{hab.recommended_site_id}</span></div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-[2px] bg-[#1A1E28] border border-[#2A3040]">
                  <Icon name="warning_amber" className="text-[16px] text-severity-amber" />
                  <span className="text-[12px] font-mono text-phase-text-secondary">No suitable site identified</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">
            {/* Risk Assessment */}
            <div className="bg-phase-elevated rounded-[4px] border border-[#1E2330] p-4">
              <h3 className="text-[13px] font-semibold text-phase-text mb-4 flex items-center gap-2">
                <Icon name="gpp_maybe" className="text-[16px] text-phase-text-secondary" />Risk Assessment
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-phase-card rounded-[4px] border border-[#1E2330] p-3 text-center">
                  <span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">Risk Score</span>
                  <span className={`text-[28px] font-mono font-bold ${RISK_LEVEL_COLORS[hab.risk_level].text}`}>{hab.risk_score}</span>
                  {hab.low_confidence && <LowConfidenceBadge />}
                </div>
                <div className="bg-phase-card rounded-[4px] border border-[#1E2330] p-3 text-center">
                  <span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">Risk Level</span>
                  <span className={`inline-block px-3 py-1 rounded-[2px] text-[13px] font-mono font-semibold text-white ${RISK_LEVEL_COLORS[hab.risk_level].bg}`}>{hab.risk_level}</span>
                </div>
                <div className="bg-phase-card rounded-[4px] border border-[#1E2330] p-3 text-center">
                  <span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">Priority</span>
                  <span className={`inline-block px-3 py-1 rounded-[2px] text-[13px] font-mono font-semibold text-white ${PRIORITY_COLORS[hab.relocation_priority].bg}`}>{hab.relocation_priority}</span>
                </div>
              </div>
            </div>

            {/* Top Contributing Factors — replaces old Hazard Exposure + Vulnerability Factors */}
            <TopFactorsList factors={hab.top_factors} />
          </div>
        </div>
      </div>
    </main>
  );
}
