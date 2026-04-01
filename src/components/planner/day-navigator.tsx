"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";

interface DayNavigatorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DayNavigator({ date, onDateChange }: DayNavigatorProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onDateChange(subDays(date, 1))}
        className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      <span className="text-sm font-medium text-stone-700 min-w-[240px] text-center">
        {format(date, "EEEE, MMMM d, yyyy")}
      </span>

      <button
        onClick={() => onDateChange(addDays(date, 1))}
        className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
      >
        <ChevronRight size={20} />
      </button>

      <Button variant="secondary" size="sm" onClick={() => onDateChange(new Date())}>
        Today
      </Button>
    </div>
  );
}
