/**
 * SkeletonLoader — simple pulsing placeholder for loading states.
 */
export function SkeletonLoader({ rows = 5, className = "" }) {
  return (
    <div className={`animate-pulse flex flex-col gap-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-10 bg-surface-container-high rounded-[2px]"
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCards — grid of pulsing card placeholders for stat cards.
 */
export function SkeletonCards({ count = 5 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-gutter animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-high border border-border-subtle rounded-[4px] p-3 h-20"
        />
      ))}
    </div>
  );
}

/**
 * SkeletonBars — placeholder for horizontal progress bars.
 */
export function SkeletonBars({ count = 3 }) {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <div className="h-4 w-40 bg-surface-container-high rounded-[2px]" />
            <div className="h-4 w-10 bg-surface-container-high rounded-[2px]" />
          </div>
          <div className="h-2 bg-surface-container-high rounded-full" />
        </div>
      ))}
    </div>
  );
}
