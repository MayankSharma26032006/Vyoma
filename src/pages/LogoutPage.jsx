import { Link } from "react-router-dom";
import Icon from "../components/ui/Icon.jsx";

export default function LogoutPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-phase-bg p-6 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-phase-elevated border border-[#1E2330] flex items-center justify-center mx-auto mb-4">
          <Icon name="logout" className="text-[28px] text-phase-text-secondary" />
        </div>
        <h2 className="text-[20px] font-semibold text-phase-text mb-2">
          Signed Out
        </h2>
        <p className="text-[14px] text-phase-text-secondary mb-6">
          You have been logged out of the VYOMA GIS Operational Suite.
          Authentication is not yet implemented — this is a placeholder page.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[4px] bg-phase-card border border-[#1E2330] text-phase-text text-[13px] font-mono hover:bg-phase-elevated transition-colors"
        >
          <Icon name="login" className="text-[16px]" />
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
