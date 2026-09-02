import { useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as maplibregl from "maplibre-gl";

const RISK_COLORS = {
  RED: "#DC2626",
  ORANGE: "#D97706",
  GREEN: "#16A34A",
};

// Idukki district center based on mock data coordinates
const DEFAULT_CENTER = [77.18, 9.83];
const DEFAULT_ZOOM = 11;

/**
 * Build GeoJSON FeatureCollection from village data.
 */
function buildVillageGeoJSON(data) {
  return {
    type: "FeatureCollection",
    features: data.map((v) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [v.longitude, v.latitude] },
      properties: {
        village_id: v.village_id,
        name: v.name,
        district: v.district,
        risk_level: v.risk_level,
        risk_score: v.risk_score,
        population: v.population,
      },
    })),
  };
}

/**
 * Create an HTML marker element for a village.
 * RED markers get a pulsing outer ring via the critical-pulse keyframe.
 */
function createMarkerEl(risk_level) {
  const wrapper = document.createElement("div");
  wrapper.className = "vyoma-marker";
  wrapper.style.cssText = "width:14px;height:14px;position:relative;cursor:pointer;";

  if (risk_level === "RED") {
    const pulse = document.createElement("div");
    pulse.className = "critical-marker";
    pulse.style.cssText = `position:absolute;inset:-4px;border-radius:50%;background:${RISK_COLORS.RED}40;`;
    wrapper.appendChild(pulse);
  }

  const dot = document.createElement("div");
  dot.style.cssText = `position:absolute;inset:0;border-radius:50%;background:${RISK_COLORS[risk_level]};border:2px solid ${RISK_COLORS[risk_level]}40;box-shadow:0 0 6px ${RISK_COLORS[risk_level]}80;`;
  wrapper.appendChild(dot);

  return wrapper;
}

function buildPopupHTML(props) {
  return `<div style="padding:10px;font-family:Geist,sans-serif;background:#12151C;color:#E8EAED;border-radius:4px;border:1px solid #1E2330;min-width:160px;">
    <div style="font-size:14px;font-weight:500;margin-bottom:2px;">${props.name}</div>
    <div style="font-size:11px;color:#9CA3AF;font-family:JetBrains Mono,monospace;margin-bottom:6px;">${props.village_id}</div>
    <div style="font-size:12px;font-family:JetBrains Mono,monospace;margin-bottom:8px;">
      Score: <span style="color:${RISK_COLORS[props.risk_level]};font-weight:600;">${props.risk_score}</span>
      &nbsp;&middot;&nbsp; Pop: ${props.population.toLocaleString()}
    </div>
    <button id="popup-navigate-btn" data-village-id="${props.village_id}" style="width:100%;padding:5px 8px;font-size:11px;font-family:Geist,sans-serif;font-weight:500;background:#1A1E28;color:#E8EAED;border:1px solid #2A3040;border-radius:2px;cursor:pointer;text-align:center;transition:background 0.15s;">
      View Details &rarr;
    </button>
  </div>`;
}

/**
 * GisMap — reusable MapLibre GL JS map component.
 *
 * Props:
 *   height            — CSS height (default "100%")
 *   className         — extra classes on the container div
 *   activeRiskLevels  — Set<string> of visible risk levels ("RED", "ORANGE", "GREEN")
 *   district          — string filter (null = all districts)
 *   showControls      — show zoom controls (default true)
 *   showPopups        — enable click-to-popup (default true)
 *   externalMapRef    — optional React ref to expose the map instance
 */
export default function GisMap({
  height = "100%",
  className = "",
  activeRiskLevels = new Set(["RED", "ORANGE", "GREEN"]),
  district = null,
  showControls = true,
  showPopups = true,
  externalMapRef,
  villages = null,
}) {
  const villageData = villages || [];
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]); // { marker, village }
  const navigate = useNavigate();

  // Expose map instance to parent via ref
  useEffect(() => {
    if (externalMapRef) {
      externalMapRef.current = mapRef.current;
    }
  });

  // Filter markers when props change
  // Serialize Set to string for reliable React dependency tracking
  const riskKey = Array.from(activeRiskLevels).sort().join(",");
  useEffect(() => {
    if (!mapRef.current || markersRef.current.length === 0) return;
    markersRef.current.forEach(({ marker, village }) => {
      const visible =
        activeRiskLevels.has(village.risk_level) &&
        (district === null || village.district === district);
      marker.getElement().style.visibility = visible ? "visible" : "hidden";
      marker.getElement().style.pointerEvents = visible ? "auto" : "none";
    });
  }, [riskKey, district]);

  const handlePopupNavigate = useCallback(
    (villageId) => {
      navigate(`/villages/${villageId}`);
    },
    [navigate]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-base",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      maxZoom: 18,
      renderWorldCopies: false,
    });

    if (showControls) {
      map.addControl(new maplibregl.NavigationControl(), "top-right");
    }

    map.on("load", () => {
      const geojson = buildVillageGeoJSON(villageData);

      map.addSource("villages", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "villages",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#374151",
          "circle-stroke-color": "#6B7280",
          "circle-stroke-width": 1,
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
        },
      });

      // Cluster count labels
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "villages",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 11,
        },
        paint: {
          "text-color": "#E8EAED",
        },
      });

      // Add HTML markers for each village
      villageData.forEach((v) => {
        const el = createMarkerEl(v.risk_level);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([v.longitude, v.latitude]);

        if (showPopups) {
          const popup = new maplibregl.Popup({ offset: 12, closeButton: false });
          popup.setHTML(buildPopupHTML({
            village_id: v.village_id,
            name: v.name,
            risk_level: v.risk_level,
            risk_score: v.risk_score,
            population: v.population,
          }));

          // Wire navigate button after popup renders
          popup.on("open", () => {
            const btn = popup.getElement()?.querySelector("#popup-navigate-btn");
            if (btn) {
              btn.addEventListener("click", () => handlePopupNavigate(v.village_id));
              btn.addEventListener("mouseenter", () => { btn.style.background = "#2A3040"; });
              btn.addEventListener("mouseleave", () => { btn.style.background = "#1A1E28"; });
            }
          });

          marker.setPopup(popup);
        }

        marker.addTo(map);
        markersRef.current.push({ marker, village: v });
      });

      // Apply initial filters
      markersRef.current.forEach(({ marker, village }) => {
        const visible =
          activeRiskLevels.has(village.risk_level) &&
          (district === null || village.district === district);
        marker.getElement().style.visibility = visible ? "visible" : "hidden";
        marker.getElement().style.pointerEvents = visible ? "auto" : "none";
      });
    });

    mapRef.current = map;
    if (externalMapRef) externalMapRef.current = map;

    return () => {
      if (mapRef.current) {
        markersRef.current.forEach(({ marker }) => marker.remove());
        markersRef.current = [];
        mapRef.current.remove();
        mapRef.current = null;
        if (externalMapRef) externalMapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height,
        width: "100%",
        backgroundColor: "#0B0E14",
      }}
    />
  );
}
