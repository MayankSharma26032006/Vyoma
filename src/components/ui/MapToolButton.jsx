/**
 * Map tool button matching the exact Stitch design.
 * Used for zoom in/out, layers, and search controls on the map.
 */
import Icon from "./Icon.jsx";

export default function MapToolButton({ iconName, className = "" }) {
  return (
    <button
      className={`p-2 hover:bg-surface-variant text-on-surface-variant ${className}`}
    >
      <Icon name={iconName} size="18px" />
    </button>
  );
}
