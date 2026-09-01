/**
 * Top navigation bar.
 * Contains state/district selectors and trailing action icons.
 */
import Icon from "../ui/Icon.jsx";

const AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC4mMRu-wg8rPgnmhYa2OXibt1A0SQy4OkTuDQS5OPE6079trdrcWSzOd4bE2PckNSgIxPxAjcOGU82esfqyw_EtPTYY30AizDP2SRdBjzVou67YVm54kUXZb8JJ5nxjBB2p2A9QMa0ZV0kRLIdVqbj6OxBgm81mEer6z8VlZAkQ5xYxw5FQstILmFc4Rx3LhtL-uDkn9fOIBkIxbedTmXX6MWS5u8WCSYSz4z_FOHto_lKrceKpEEyiQ";

export default function TopBar() {
  return (
    <header className="bg-surface dark:bg-surface font-body-md text-body-md flex justify-between items-center w-full px-gutter h-16 border-b border-border-subtle z-30">
      {/* Left: Selectors */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-base border border-border-subtle rounded-[6px] px-3 py-1.5 hover:bg-surface-container transition-colors cursor-pointer">
            <span className="font-label-md text-label-md text-on-surface">
              State: Select State
            </span>
            <Icon name="arrow_drop_down" className="text-[16px] text-on-surface-variant" />
          </div>
          <div className="flex items-center gap-2 bg-surface-base border border-border-subtle rounded-[6px] px-3 py-1.5 hover:bg-surface-container transition-colors cursor-pointer">
            <span className="font-label-md text-label-md text-on-surface">
              District: Select District
            </span>
            <Icon name="arrow_drop_down" className="text-[16px] text-on-surface-variant" />
          </div>
        </div>
      </div>

      {/* Right: Action icons + Avatar */}
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-[4px] hover:bg-surface-variant">
          <Icon name="notifications" />
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-[4px] hover:bg-surface-variant">
          <Icon name="settings" />
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-border-subtle overflow-hidden ml-2 cursor-pointer">
          <img
            className="w-full h-full object-cover"
            alt="User avatar"
            src={AVATAR_URL}
          />
        </div>
      </div>
    </header>
  );
}
