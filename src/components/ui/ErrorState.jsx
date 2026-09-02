/**
 * ErrorState — displayed when an API call fails.
 */
import Icon from "./Icon.jsx";

export default function ErrorState({ message = "Data could not be loaded. Check network and try again.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <Icon name="error_outline" className="text-severity-red text-[40px]" />
      <p className="text-on-surface-variant font-body-md text-body-md max-w-md">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-surface-container-high border border-border-subtle rounded-[4px] text-primary font-label-md text-label-md hover:bg-surface-variant transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
