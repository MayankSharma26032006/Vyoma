/**
 * GIS Map panel matching the exact Stitch design.
 * Contains the map image, filter toggles, zoom/layers/search controls, and legend.
 * Filter colors use the hazard-type palette, never severity colors.
 */
import { useState } from "react";
import MapFilterButton from "../ui/MapFilterButton.jsx";
import MapToolButton from "../ui/MapToolButton.jsx";
import Icon from "../ui/Icon.jsx";

const MAP_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB0vGMxF6_hJ_M6aRq0KRVixWw5kGUu_IbOuzrhV176JSQH0wP2ZIB5xL0GsoEwEYMUBT05-x-r6GbLZKya8-jNQHCuXtENyszlvFOcrSnVBSS61q64pAOsiUjBI6HFSy4q0IJAplFZzMlBIlgIQjiGWiurKafNBH2TwOEUN1mPqaVLb8A2-65YFb4KfqcEgZOOU39R9OfYFqt24i2DRLUhh5IQqSKW6GUP1UoxmEVQrFbPLJnGosdwRQ";

const FILTERS = [
  { key: "redZones", label: "Red Zones", color: "bg-severity-red" },
  { key: "floodRisk", label: "Flood Risk", color: "bg-hazard-flood" },
  { key: "landslide", label: "Landslide", color: "bg-hazard-landslide" },
];

export default function MapPanel() {
  const [activeFilters, setActiveFilters] = useState({
    redZones: true,
    floodRisk: false,
    landslide: false,
  });

  const toggleFilter = (key) => {
    setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="lg:col-span-3 bg-surface-base border border-border-subtle rounded-lg relative overflow-hidden flex flex-col">
      {/* Map Filter Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-surface-container/90 backdrop-blur-sm border border-border-subtle rounded-lg p-2 flex gap-2 shadow-xl">
          {FILTERS.map((f) => (
            <MapFilterButton
              key={f.key}
              label={f.label}
              color={f.color}
              active={activeFilters[f.key]}
              onClick={() => toggleFilter(f.key)}
            />
          ))}
        </div>
      </div>

      {/* Zoom / Tools */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-surface-container-high border border-border-subtle rounded flex flex-col shadow-xl">
          <MapToolButton iconName="add" className="border-b border-border-subtle" />
          <MapToolButton iconName="remove" />
        </div>
        <button className="bg-surface-container-high border border-border-subtle rounded p-2 shadow-xl text-on-surface-variant hover:bg-surface-variant">
          <Icon name="layers" size="18px" />
        </button>
        <button className="bg-surface-container-high border border-border-subtle rounded p-2 shadow-xl text-on-surface-variant hover:bg-surface-variant">
          <Icon name="search" size="18px" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-surface-container/90 backdrop-blur-sm border border-border-subtle rounded-lg p-3 shadow-xl">
        <h4 className="font-label-sm text-label-sm text-on-surface mb-2 uppercase tracking-wide">
          Legend
        </h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-severity-red/40 border border-severity-red rounded-sm" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Critical Zone
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="home_pin" className="text-[16px] text-severity-amber" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Vulnerable Habitation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="location_on" className="text-[16px] text-severity-green" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Relocation Site
            </span>
          </div>
        </div>
      </div>

      {/* Map Image */}
      <div className="w-full h-full relative" data-location="Idukki">
        <div
          className="bg-cover bg-center w-full h-full opacity-80"
          style={{ backgroundImage: `url('${MAP_IMAGE_URL}')` }}
        />
      </div>
    </div>
  );
}
