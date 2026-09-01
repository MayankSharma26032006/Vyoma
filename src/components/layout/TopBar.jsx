/**
 * Top navigation bar.
 * Contains cascading state/district selectors, hamburger menu (mobile), and trailing action icons.
 */
import { useState, useRef, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { useSelection } from "../../context/SelectionContext.jsx";

const AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC4mMRu-wg8rPgnmhYa2OXibt1A0SQy4OkTuDQS5OPE6079trdrcWSzOd4bE2PckNSgIxPxAjcOGU82esfqyw_EtPTYY30AizDP2SRdBjzVou67YVm54kUXZb8JJ5nxjBB2p2A9QMa0ZV0kRLIdVqbj6OxBgm81mEer6z8VlZAkQ5xYxw5FQstILmFc4Rx3LhtL-uDkn9fOIBkIxbedTmXX6MWS5u8WCSYSz4z_FOHto_lKrceKpEEyiQ";

function Dropdown({ label, value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-surface-base border border-border-subtle rounded-[6px] px-3 py-1.5 hover:bg-surface-container transition-colors cursor-pointer min-w-[140px]"
      >
        <span className={`font-label-md text-label-md ${value ? "text-on-surface" : "text-on-surface-variant"}`}>
          {label}: {value || placeholder}
        </span>
        <Icon
          name="arrow_drop_down"
          className={`text-[16px] text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[180px] bg-surface-container border border-border-subtle rounded-[4px] shadow-xl z-50 max-h-[240px] overflow-y-auto">
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-[13px] font-mono hover:bg-surface-variant transition-colors ${
              value === null ? "text-on-surface bg-surface-variant" : "text-on-surface-variant"
            }`}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] font-mono hover:bg-surface-variant transition-colors ${
                value === opt ? "text-on-surface bg-surface-variant" : "text-on-surface-variant"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopBar({ onMenuToggle }) {
  const { selectedState, selectedDistrict, states, districts, selectState, selectDistrict } = useSelection();

  return (
    <header className="bg-surface dark:bg-surface font-body-md text-body-md flex justify-between items-center w-full px-gutter h-16 border-b border-border-subtle z-30">
      {/* Left: Hamburger (mobile) + Selectors */}
      <div className="flex items-center gap-4">
        {/* Hamburger — visible only on mobile */}
        <button
          onClick={onMenuToggle}
          className="md:hidden text-on-surface-variant hover:text-primary transition-colors p-1 rounded-[4px] hover:bg-surface-variant"
        >
          <Icon name="menu" />
        </button>

        <div className="flex items-center gap-4">
          <Dropdown
            label="State"
            value={selectedState}
            options={states}
            onChange={selectState}
            placeholder="Select State"
          />
          <Dropdown
            label="District"
            value={selectedDistrict}
            options={districts}
            onChange={selectDistrict}
            placeholder={selectedState ? "Select District" : "Select State first"}
          />
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
