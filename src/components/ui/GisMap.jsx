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

const CIRCLE_LAYER_ID = "villages-circle";
const RED_HALO_LAYER_ID = "villages-red-halo";
const VILLAGE_SOURCE_ID = "villages";

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
 * Build a MapLibre filter expression for risk_level + district.
 * Returns an expression array usable with map.setFilter().
 */
function buildFilterExpression(activeRiskLevels, district) {
  const riskList = Array.from(activeRiskLevels);
  const riskFilter =
    riskList.length === 3
      ? null // all visible, no filter needed
      : ["in", ["get", "risk_level"], ["literal", riskList]];

  const districtFilter = district
    ? ["==", ["get", "district"], district]
    : null;

  if (riskFilter && districtFilter) return ["all", riskFilter, districtFilter];
  if (riskFilter) return riskFilter;
  if (districtFilter) return districtFilter;
  return null;
}

/**
 * Dark-themed popup HTML for a village feature.
 */
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
 *   villages          — array of village objects (null = empty)
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
  const popupRef = useRef(null);
  const navigate = useNavigate();

  // Expose map instance to parent via ref
  useEffect(() => {
    if (externalMapRef) {
      externalMapRef.current = mapRef.current;
    }
  });

  // Update filters when risk levels or district change
  const riskKey = Array.from(activeRiskLevels).sort().join(",");
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(CIRCLE_LAYER_ID)) return;
    const filter = buildFilterExpression(activeRiskLevels, district);
    map.setFilter(CIRCLE_LAYER_ID, filter);
    map.setFilter(RED_HALO_LAYER_ID, filter ? ["all", filter, ["==", ["get", "risk_level"], "RED"]] : ["==", ["get", "risk_level"], "RED"]);
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
    });

    if (showControls) {
      map.addControl(new maplibregl.NavigationControl(), "top-right");
    }

    map.on("load", () => {
      // --- GeoJSON source (no clustering) ---
      const geojson = buildVillageGeoJSON(villageData);
      map.addSource(VILLAGE_SOURCE_ID, {
        type: "geojson",
        data: geojson,
      });

      // --- RED pulse halo layer (behind main circles, larger + lower opacity) ---
      map.addLayer({
        id: RED_HALO_LAYER_ID,
        type: "circle",
        source: VILLAGE_SOURCE_ID,
        filter: ["==", ["get", "risk_level"], "RED"],
        paint: {
          "circle-radius": 16,
          "circle-color": RISK_COLORS.RED,
          "circle-opacity": 0.2,
          "circle-stroke-width": 0,
        },
      });

      // --- Main circle layer ---
      map.addLayer({
        id: CIRCLE_LAYER_ID,
        type: "circle",
        source: VILLAGE_SOURCE_ID,
        paint: {
          "circle-radius": 7,
          "circle-color": [
            "match",
            ["get", "risk_level"],
            "RED", RISK_COLORS.RED,
            "ORANGE", RISK_COLORS.ORANGE,
            "GREEN", RISK_COLORS.GREEN,
            "#9CA3AF", // fallback
          ],
          "circle-stroke-color": [
            "match",
            ["get", "risk_level"],
            "RED", "#F87171",
            "ORANGE", "#FBBF24",
            "GREEN", "#4ADE80",
            "#9CA3AF",
          ],
          "circle-stroke-width": 2,
        },
      });

      // --- Cursor change on hover ---
      map.on("mouseenter", CIRCLE_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CIRCLE_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      // --- Click-to-popup ---
      if (showPopups) {
        // Close any existing popup
        const closePopup = () => {
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }
        };

        map.on("click", CIRCLE_LAYER_ID, (e) => {
          if (!e.features || e.features.length === 0) return;
          const props = e.features[0].properties;
          const coords = e.features[0].geometry.coordinates.slice();

          closePopup();

          const popup = new maplibregl.Popup({ offset: 12, closeButton: false })
            .setLngLat(coords)
            .setHTML(buildPopupHTML({
              village_id: props.village_id,
              name: props.name,
              risk_level: props.risk_level,
              risk_score: props.risk_score,
              population: props.population,
            }))
            .addTo(map);

          popupRef.current = popup;

          // Wire navigate button after popup renders
          popup.on("open", () => {
            const btn = popup.getElement()?.querySelector("#popup-navigate-btn");
            if (btn) {
              btn.addEventListener("click", () => handlePopupNavigate(props.village_id));
              btn.addEventListener("mouseenter", () => { btn.style.background = "#2A3040"; });
              btn.addEventListener("mouseleave", () => { btn.style.background = "#1A1E28"; });
            }
          });
        });

        // Close popup when clicking empty map area
        map.on("click", (e) => {
          if (!e.defaultPrevented) closePopup();
        });
      }
    });

    mapRef.current = map;
    if (externalMapRef) externalMapRef.current = map;

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      if (mapRef.current) {
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
