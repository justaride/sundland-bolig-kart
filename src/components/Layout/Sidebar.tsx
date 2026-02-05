import { useState, type ReactNode } from "react";
import {
  MapPin,
  ChartBar,
  Buildings,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { CATEGORY_COLORS } from "../../constants/designSystem";

type View = "naering" | "dashboard" | "bolig";

type NavItem = {
  value: View;
  label: string;
  icon: typeof MapPin;
};

const NAV_ITEMS: NavItem[] = [
  { value: "naering", label: "Næring", icon: MapPin },
  { value: "dashboard", label: "Dashboard", icon: ChartBar },
  { value: "bolig", label: "Bolig", icon: Buildings },
];

const categories = Object.entries(CATEGORY_COLORS) as [string, string][];

type Props = {
  view: View;
  onViewChange: (v: View) => void;
  filterPanel: ReactNode;
};

export default function Sidebar({ view, onViewChange, filterPanel }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`${collapsed ? "w-20" : "w-72"} shrink-0 transition-all duration-300 ease-in-out flex flex-col m-3 mr-0`}
    >
      <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-white/20">
          {collapsed ? (
            <div className="w-10 h-10 mx-auto rounded-xl bg-slate-900 text-white flex items-center justify-center font-display text-lg font-semibold">
              S
            </div>
          ) : (
            <h1 className="text-xl font-semibold text-gray-900 font-display">
              Sundland
            </h1>
          )}
        </div>

        <nav className="px-3 py-3 space-y-1">
          {NAV_ITEMS.map(({ value, label, icon: Icon }) => {
            const active = view === value;
            return (
              <button
                key={value}
                onClick={() => onViewChange(value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-white text-gray-900 shadow-md border-l-[3px] border-l-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50 border-l-[3px] border-l-transparent"
                }`}
              >
                <Icon
                  size={20}
                  weight={active ? "fill" : "regular"}
                  className={`shrink-0 transition-transform ${active ? "" : "group-hover:scale-110"}`}
                />
                {!collapsed && label}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="flex-1 overflow-y-auto scrollbar-thin border-t border-white/20">
            {filterPanel}
          </div>
        )}

        {!collapsed && (
          <div className="px-4 py-3 border-t border-white/20">
            <div className="flex flex-wrap gap-2">
              {categories.map(([name, color]) => (
                <div
                  key={name}
                  className="flex items-center gap-1.5 text-[11px] text-gray-500"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ background: color }}
                  />
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="px-4 py-3 border-t border-white/20 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          {collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
          {!collapsed && <span className="ml-2 text-xs">Minimer</span>}
        </button>
      </div>
    </div>
  );
}
