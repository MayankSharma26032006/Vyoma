import { Link } from "react-router-dom";
import Icon from "../components/ui/Icon.jsx";

export default function NotFoundPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-phase-bg p-6 flex items-center justify-center">
      <div className="text-center max-w-md">
        <span className="text-[64px] font-mono font-bold text-phase-text-secondary/20 block mb-2">
          404
        </span>
        <Icon
          name="explore_off"
          className="text-[48px] text-phase-text-secondary mb-4 block mx-auto"
        />
        <h2 className="text-[20px] font-semibold text-phase-text mb-2">
          Page Not Found
        </h2>
        <p className="text-[14px] text-phase-text-secondary mb-6">
          The requested route does not exist in the VYOMA operational suite.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[4px] bg-phase-card border border-[#1E2330] text-phase-text text-[13px] font-mono hover:bg-phase-elevated transition-colors"
        >
          <Icon name="dashboard" className="text-[16px]" />
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
