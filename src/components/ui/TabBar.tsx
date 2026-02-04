import type { ComponentType } from "react";

type Tab = {
  key: string;
  label: string;
  icon?: ComponentType<{ size?: number; weight?: string }>;
};

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
};

export default function TabBar({ tabs, active, onChange }: Props) {
  return (
    <div className="glass-panel flex gap-1 p-1 rounded-xl">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-slate-900 text-white shadow-md scale-105"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
          >
            {Icon && <Icon size={14} weight={isActive ? "fill" : "regular"} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
