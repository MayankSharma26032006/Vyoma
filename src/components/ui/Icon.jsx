/**
 * Material Symbols Outlined icon component.
 * Preserves exact Stitch icon behavior including fill variant support.
 */
export default function Icon({ name, className = "", fill = false, size }) {
  const sizeStyle = size ? { fontSize: size } : undefined;

  return (
    <span
      className={`material-symbols-outlined ${fill ? "icon-fill" : ""} ${className}`}
      style={sizeStyle}
    >
      {name}
    </span>
  );
}
