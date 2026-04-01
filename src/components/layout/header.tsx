"use client";

import { Calendar } from "lucide-react";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-stone-200 bg-white">
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-stone-500" />
        <h1 className="text-base font-semibold text-stone-800">Day Planner</h1>
      </div>
      {children}
    </header>
  );
}
