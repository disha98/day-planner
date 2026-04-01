"use client";

import { useMemo } from "react";
import { addDays, format, isToday } from "date-fns";
import { TimeBlock } from "@/types";
import { DayColumn } from "@/components/planner/day-column";

interface WeeklyGridProps {
  weekStart: Date;
  blocks: TimeBlock[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onSlotClick: (date: string, hour: number) => void;
  onBlockClick: (block: TimeBlock) => void;
}

export function WeeklyGrid({
  weekStart,
  blocks,
  selectedDate,
  onSelectDate,
  onSlotClick,
  onBlockClick,
}: WeeklyGridProps) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const blocksByDate = useMemo(() => {
    const map: Record<string, TimeBlock[]> = {};
    for (const block of blocks) {
      if (!map[block.date]) map[block.date] = [];
      map[block.date].push(block);
    }
    return map;
  }, [blocks]);

  return (
    <div className="grid grid-cols-7 flex-1 overflow-y-auto border-t border-stone-200">
      {days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return (
          <DayColumn
            key={dateStr}
            date={day}
            blocks={blocksByDate[dateStr] ?? []}
            isToday={isToday(day)}
            onSlotClick={onSlotClick}
            onBlockClick={onBlockClick}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        );
      })}
    </div>
  );
}
