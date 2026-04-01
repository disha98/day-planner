"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addWeeks, subWeeks, endOfWeek, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";

interface DateNavigatorProps {
  weekStart: Date;
  onWeekChange: (date: Date) => void;
}

export function DateNavigator({ weekStart, onWeekChange }: DateNavigatorProps) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const goToToday = () => {
    onWeekChange(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onWeekChange(subWeeks(weekStart, 1))}
      >
        <ChevronLeft size={16} />
      </Button>

      <span className="text-sm font-medium text-stone-700 min-w-[200px] text-center">
        {format(weekStart, "MMM d")} &ndash; {format(weekEnd, "MMM d, yyyy")}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onWeekChange(addWeeks(weekStart, 1))}
      >
        <ChevronRight size={16} />
      </Button>

      <Button variant="secondary" size="sm" onClick={goToToday}>
        Today
      </Button>
    </div>
  );
}
