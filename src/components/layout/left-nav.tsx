"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CalendarDays, List, Sun, StickyNote, CheckSquare, Cog, Upload } from "lucide-react";

interface NavItem {
  icon: typeof CalendarDays;
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { icon: List, href: "/planner?view=list", label: "List" },
  { icon: Sun, href: "/planner?view=day", label: "Day" },
  { icon: CalendarDays, href: "/planner?view=calendar", label: "Week" },
  { icon: StickyNote, href: "/notes", label: "Notes" },
  { icon: CheckSquare, href: "/todos", label: "To-Do" },
];

const bottomItems: NavItem[] = [
  { icon: Upload, href: "/import", label: "Import" },
  { icon: Cog, href: "/settings", label: "Settings" },
];

function NavButton({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg w-12 transition-colors ${
        isActive
          ? "text-blue-600 bg-blue-50 border-l-2 border-blue-500"
          : "text-stone-400 hover:text-stone-600 hover:bg-stone-50 border-l-2 border-transparent"
      }`}
    >
      <Icon size={20} />
      <span className="text-[10px] font-medium">{item.label}</span>
    </Link>
  );
}

export function LeftNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  function isActive(item: NavItem) {
    const [itemPath, itemQuery] = item.href.split("?");
    if (pathname !== itemPath && !pathname.startsWith(itemPath + "/")) {
      return false;
    }
    // For planner sub-views, match on query param
    if (itemQuery) {
      const itemView = new URLSearchParams(itemQuery).get("view");
      if (itemPath === "/planner") {
        // "list" is active when on /planner with no view param or view=list
        if (itemView === "list") return !view || view === "list";
        return view === itemView;
      }
    }
    return true;
  }

  return (
    <nav className="w-16 h-full bg-white border-r border-stone-200 flex flex-col items-center pt-4 gap-1 relative z-50">
      {navItems.map((item) => (
        <NavButton key={item.href} item={item} isActive={isActive(item)} />
      ))}

      <div className="mt-auto mb-16 flex flex-col gap-1">
        {bottomItems.map((item) => (
          <NavButton key={item.href} item={item} isActive={isActive(item)} />
        ))}
      </div>
    </nav>
  );
}
