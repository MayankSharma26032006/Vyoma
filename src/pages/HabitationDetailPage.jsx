import { useParams, Link } from "react-router-dom";
import Icon from "../components/ui/Icon.jsx";
import habitationData from "../../mockData/habitations.json";

const SEVERITY_COLORS = { critical: "bg-severity-red", high: "bg-severity-orange", medium: "bg-severity-amber", low: "bg-severity-green" };
const SEVERITY_TEXT = { critical: "text-severity-red", high: "text-severity-orange", medium: "text-severity-amber", low: "text-severity-green" };
const HAZARD_COLORS = { flood: "bg-hazard-flood", landslide: "bg-hazard-landslide", earthquake: "bg-hazard-earthquake", cyclone: "bg-hazard-cyclone" };
const HAZARD_TEXT = { flood: "text-hazard-flood", landslide: "text-hazard-landslide", earthquake: "text-hazard-earthquake", cyclone: "text-hazard-cyclone" };
const HAZARD_ICONS = { flood: "water", landslide: "terrain", earthquake: "vibration", cyclone: "air" };

function MiniMapPlaceholder({ name }) {
  return (
    <div className="bg-phase-card rounded border border-[#1E2330] h-[180px] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-16 h-16 border border-phase-text-secondary/20 rounded" />
        <div className="absolute bottom-6 right-6 w-24 h-12 border border-phase-text-secondary/20 rounded" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-severity-red rounded-full" />
      </div>
      <Icon name="map" className="text-[28px] text-phase-text-secondary/40 mb-1" />
      <span className="text-[11px] font-mono text-phase-text-secondary/60">{name}</span>
      <span className="text-[10px] text-phase-text-secondary/40 mt-0.5">Interactive map coming soon</span>
    </div>
  );
}

function HazardBar({ type, level }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-[120px] shrink-0">
        <Icon name={HAZARD_ICONS[type]} className={`text-[16px] ${HAZARD_TEXT[type]}`} />
        <span className="text-[13px] text-phase-text capitalize">{type}</span>
      </div>
      <div className="flex-1 h-[6px] bg-[#0B0E14] rounded-sm overflow-hidden border border-[#1E2330]">
        <div className={`h-full ${HAZARD_COLORS[type]} rounded-sm`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-[12px] font-mono text-phase-text-secondary w-[36px] text-right">{level}%</span>
    </div>
  );
}

export default function HabitationDetailPage() {
  const { id } = useParams();
  const hab = habitationData.find(h => h.id === id);

  if (!hab) {
    return (
      <main className="flex-1 overflow-y-auto bg-phase-bg p-6 flex items-center justify-center">
        <div className="text-center">
          <Icon name="error_outline" className="text-[48px] text-phase-text-secondary mb-3 block mx-auto" />
          <h2 className="text-lg text-phase-text mb-1">Habitation not found</h2>
          <p className="text-sm text-phase-text-secondary mb-4">No habitation matches ID: {id}</p>
          <Link to="/habitations" className="px-4 py-2 rounded border border-[#2A3040] text-phase-text-secondary text-[13px] font-mono hover:bg-phase-elevated transition-colors">Back to Habitations</Link>
        </div>
      </main>
    );
  }

  const exposureEntries = Object.entries(hab.hazard_exposure).filter(([, v]) => v > 0);

  return (
    <main className="flex-1 overflow-y-auto bg-phase-bg p-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Breadcrumb + Header */}
        <div className="mb-6">
          <Link to="/habitations" className="inline-flex items-center gap-1 text-[12px] font-mono text-phase-text-secondary hover:text-phase-text transition-colors mb-3">
            <Icon name="arrow_back" className="text-[14px]" />Habitations
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-phase-text tracking-tight">{hab.name}</h1>
              <p className="text-sm text-phase-text-secondary mt-1 font-mono">{hab.id} &mdash; {hab.block} Block</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-mono text-white ${SEVERITY_COLORS[hab.risk_level]}`}>{hab.risk_level}</span>
              <span className="inline-block px-2.5 py-1 rounded text-[11px] font-mono text-phase-text bg-[#1A1E28] border border-[#1E2330]">{hab.priority}</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">
            <MiniMapPlaceholder name={hab.name} />

            {/* Location */}
            <div className="bg-phase-elevated rounded border border-[#1E2330] p-4">
              <h3 className="text-[13px] font-semibold text-phase-text mb-3 flex items-center gap-2">
                <Icon name="location_on" className="text-[16px] text-phase-text-secondary" />Location
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Block</span><span className="text-[13px] text-phase-text">{hab.block}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Village</span><span className="text-[13px] text-phase-text">{hab.village}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Coordinates</span><span className="text-[13px] text-phase-text font-mono">{hab.coordinates.lat.toFixed(4)}, {hab.coordinates.lng.toFixed(4)}</span></div>
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-phase-elevated rounded border border-[#1E2330] p-4">
              <h3 className="text-[13px] font-semibold text-phase-text mb-3 flex items-center gap-2">
                <Icon name="groups" className="text-[16px] text-phase-text-secondary" />Demographics
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Population</span><span className="text-[13px] text-phase-text font-mono">{hab.population.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Households</span><span className="text-[13px] text-phase-text font-mono">{hab.households.toLocaleString()}</span></div>
              </div>
            </div>

            {/* Recommended Site */}
            <div className={`bg-phase-elevated rounded border border-[#1E2330] p-4 ${hab.recommended_site_id ? "cursor-pointer hover:border-[#2A3040] transition-colors" : ""}`}>
              <h3 className="text-[13px] font-semibold text-phase-text mb-3 flex items-center gap-2">
                <Icon name="location_city" className="text-[16px] text-phase-text-secondary" />Recommended Site
              </h3>
              {hab.recommended_site_id ? (
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Site</span><span className="text-[13px] text-phase-text">{hab.recommended_site_name}</span></div>
                  <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">ID</span><span className="text-[13px] text-phase-text font-mono">{hab.recommended_site_id}</span></div>
                  <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Suitability</span><span className="text-[13px] text-phase-text font-mono">{hab.recommended_site_suitability}%</span></div>
                  <div className="flex justify-between"><span className="text-[13px] text-phase-text-secondary">Capacity</span><span className="text-[13px] text-phase-text font-mono">{hab.recommended_site_capacity.toLocaleString()}</span></div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-[#1A1E28] border border-[#2A3040]">
                  <Icon name="warning_amber" className="text-[16px] text-severity-amber" />
                  <span className="text-[12px] font-mono text-phase-text-secondary">No suitable site identified</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">
            {/* Risk Assessment */}
            <div className="bg-phase-elevated rounded border border-[#1E2330] p-4">
              <h3 className="text-[13px] font-semibold text-phase-text mb-4 flex items-center gap-2">
                <Icon name="gpp_maybe" className="text-[16px] text-phase-text-secondary" />Risk Assessment
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-phase-card rounded border border-[#1E2330] p-3 text-center">
                  <span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">Risk Score</span>
                  <span className={`text-[28px] font-mono font-bold ${SEVERITY_TEXT[hab.risk_level]}`}>{hab.risk_score}</span>
                </div>
                <div className="bg-phase-card rounded border border-[#1E2330] p-3 text-center">
                  <span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">Risk Level</span>
                  <span className={`inline-block px-3 py-1 rounded text-[13px] font-mono font-semibold text-white ${SEVERITY_COLORS[hab.risk_level]}`}>{hab.risk_level}</span>
                </div>
                <div className="bg-phase-card rounded border border-[#1E2330] p-3 text-center">
                  <span className="text-[11px] text-phase-text-secondary uppercase tracking-wider font-mono block mb-1">Priority</span>
                  <span className="inline-block px-3 py-1 rounded text-[13px] font-mono font-semibold text-phase-text bg-[#1A1E28] border border-[#1E2330]">{hab.priority}</span>
                </div>
              </div>
            </div>

            {/* Hazard Exposure */}
            <div className="bg-phase-elevated rounded border border-[#1E2330] p-4">
              <h3 className="text-[13px] font-semibo
ld text-phase-text mb-4 flex items-center gap-2">
                <Icon name="emergency" className="text-[16px] text-phase-text-secondary" />Hazard Exposure
              </h3>
              <div className="space-y-3">
                {exposureEntries.map(([type, level]) => (
                  <HazardBar key={type} type={type} level={level} />
                ))}
              </div>
            </div>

            <div className="bg-phase-elevated rounded border border-[#1E2330] p-4">
              <h3 className="text-[13px] font-semibold text-phase-text mb-3 flex items-center gap-2">
                <Icon name="shield" className="text-[16px] text-phase-text-secondary" />Vulnerability Factors
              </h3>
              <ul className="space-y-2">
                {hab.vulnerability_factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-phase-text">
                    <span className="text-phase-text-secondary mt-1 shrink-0">&bull;</span>{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-phase-elevated rounded border border-[#1E2330] p-4">
              <h3 className="text-[13px] font-semibold text-phase-text mb-3 flex items-center gap-2">
                <Icon name="history" className="text-[16px] text-phase-text-secondary" />Disaster History
              </h3>
              {hab.disaster_history.length > 0 ? (
                <div className="space-y-3">
                  {hab.disaster_history.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b border-[#1E2330] last:border-0 last:pb-0">
                      <div className="shrink-0 mt-0.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${SEVERITY_COLORS[entry.severity]}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[12px] font-mono text-phase-text-secondary">{entry.date}</span>
                          <span className={`inline-block px-1.5 py-0 rounded text-[10px] font-mono ${HAZARD_COLORS[entry.hazard_type]} text-white`}>{entry.hazard_type}</span>
                          <span className={`inline-block px-1.5 py-0 rounded text-[10px] font-mono ${SEVERITY_COLORS[entry.severity]} text-white`}>{entry.severity}</span>
                        </div>
                        <p className="text-[13px] text-phase-text">{entry.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-phase-text-secondary italic">No disaster events recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
