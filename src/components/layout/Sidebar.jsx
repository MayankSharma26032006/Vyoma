import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon.jsx";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", to: "/" },
  { icon: "map", label: "Hazard Map", to: "/map" },
  { icon: "home_pin", label: "Villages", to: "/habitations" },
  { icon: "priority_high", label: "Relocation Priority", to: "/priority" },
  { icon: "location_on", label: "Relocation Sites", to: "/sites" },
  { icon: "analytics", label: "Analytics", to: "#" },
];

const FOOTER_ITEMS = [
  { icon: "help", label: "Help" },
  { icon: "logout", label: "Logout" },
];

function SidebarLink({ icon, label, to }) {
  const isExternal = to === "#";
  if (isExternal) {
    return (
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="flex items-center gap-3 px-3 py-2 rounded-[4px] font-label-md text-label-md transition-all duration-150 ease-in-out text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
      >
        <Icon name={icon} />
        {label}
      </a>
    );
  }
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-[4px] font-label-md text-label-md transition-all duration-150 ease-in-out ${
          isActive
            ? "bg-secondary-container text-on-secondary-container"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
        }`
      }
    >
      <Icon name={icon} />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <nav className="bg-surface-container dark:bg-surface-container flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-border-subtle w-64">
      <div className="p-gutter border-b border-border-subtle flex items-center gap-3">
        <div className="w-8 h-8 rounded-[4px] bg-primary flex items-center justify-center">
          <Icon name="explore" className="text-surface-lowest font-bold text-lg icon-fill" />
        </div>
        <div>
          <h1 className="font-headline-sm text-headline-sm font-black text-primary">VYOMA GIS</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Operational Suite</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-stack-md px-stack-sm flex flex-col gap-space-unit">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.icon} icon={item.icon} label={item.label} to={item.to} />
        ))}
      </div>
      <div className="p-stack-sm border-t border-border-subtle flex flex-col gap-space-unit">
        {FOOTER_ITEMS.map((item) => (
          <SidebarLink key={item.icon} icon={item.icon} label={item.label} to="#" />
        ))}
      </div>
    </nav>
  );
}
