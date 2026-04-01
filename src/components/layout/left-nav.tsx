"use client";

import { CalendarDays, List, Sun, Cog, Upload } from "lucide-react";

type View = "calendar" | "list" | "day" | "import" | "settings";

interface LeftNavProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const navItems: { icon: typeof CalendarDays; view: View; label: string }[] = [
  { icon: List, view: "list", label: "List" },
  { icon: Sun, view: "day", label: "Day" },
  { icon: CalendarDays, view: "calendar", label: "Week" },
];

export function LeftNav({ activeView, onViewChange }: LeftNavProps) {
  return (
    <nav className="w-16 h-full bg-white border-r border-stone-200 flex flex-col items-center pt-4 gap-1 relative z-50">
      {navItems.map(({ icon: Icon, view, label }) => {
        const isActive = activeView === view;
        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg w-12 transition-colors ${
              isActive
                ? "text-blue-600 bg-blue-50 border-l-2 border-blue-500"
                : "text-stone-400 hover:text-stone-600 hover:bg-stone-50 border-l-2 border-transparent"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}

      <div className="mt-auto mb-16 flex flex-col gap-1">
        <button
          onClick={() => onViewChange("import")}
          className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg w-12 transition-colors ${
            activeView === "import"
              ? "text-blue-600 bg-blue-50 border-l-2 border-blue-500"
              : "text-stone-400 hover:text-stone-600 hover:bg-stone-50 border-l-2 border-transparent"
          }`}
        >
          <Upload size={20} />
          <span className="text-[10px] font-medium">Import</span>
        </button>
        <button
          onClick={() => onViewChange("settings")}
          className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg w-12 transition-colors ${
            activeView === "settings"
              ? "text-blue-600 bg-blue-50 border-l-2 border-blue-500"
              : "text-stone-400 hover:text-stone-600 hover:bg-stone-50 border-l-2 border-transparent"
          }`}
        >
          <Cog size={20} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
}
