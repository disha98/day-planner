"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  format,
  addDays,
  isToday,
  isTomorrow,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from "date-fns";
import { Calendar, CheckCircle2, Circle, Plus, Video } from "lucide-react";
import { TimeBlock, Task, Category } from "@/types";
import { useTimeBlocks } from "@/lib/hooks/use-time-blocks";
import { useTasks } from "@/lib/hooks/use-tasks";

interface ListViewProps {
  weekStart: Date;
  blocks: TimeBlock[];
  categories: Category[];
  onEditBlock: (block: TimeBlock) => void;
  onDayClick: (date: string) => void;
  onAddBlock: () => void;
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${period}`;
}

function darkenColor(hex: string): string {
  // Produce a darker shade for text by reducing brightness
  const raw = hex.replace("#", "");
  const r = Math.max(0, parseInt(raw.substring(0, 2), 16) - 60);
  const g = Math.max(0, parseInt(raw.substring(2, 4), 16) - 60);
  const b = Math.max(0, parseInt(raw.substring(4, 6), 16) - 60);
  return `rgb(${r}, ${g}, ${b})`;
}

export function ListView({
  weekStart,
  blocks: parentBlocks,
  categories,
  onEditBlock,
  onDayClick,
  onAddBlock,
}: ListViewProps) {
  const [range, setRange] = useState<"week" | "two-weeks">("week");

  const nextWeekStart = addDays(weekStart, 7);
  const nextWeekStartStr = format(nextWeekStart, "yyyy-MM-dd");

  const { blocks: week2Blocks, loading: loadingBlocks2 } =
    useTimeBlocks(nextWeekStartStr);
  const { tasks: allTasks, loading: loadingTasks, updateTask } = useTasks();

  const week1Blocks = parentBlocks;

  const days = useMemo(() => {
    const totalDays = range === "week" ? 7 : 14;
    const end = addDays(weekStart, totalDays - 1);
    return eachDayOfInterval({ start: weekStart, end });
  }, [weekStart, range]);

  const allBlocks = useMemo(() => {
    if (range === "week") return week1Blocks;
    return [...week1Blocks, ...week2Blocks];
  }, [range, week1Blocks, week2Blocks]);

  const blocksByDate = useMemo(() => {
    const map: Record<string, TimeBlock[]> = {};
    for (const block of allBlocks) {
      if (!map[block.date]) map[block.date] = [];
      map[block.date].push(block);
    }
    // Sort each day's blocks by start_hour
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.start_hour - b.start_hour);
    }
    return map;
  }, [allBlocks]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of allTasks) {
      if (!task.date) continue;
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    }
    // Sort each day's tasks by sort_order
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.sort_order - b.sort_order);
    }
    return map;
  }, [allTasks]);

  const daysWithContent = useMemo(() => {
    return days.filter((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const hasBlocks = (blocksByDate[dateStr] ?? []).length > 0;
      const hasTasks = (tasksByDate[dateStr] ?? []).length > 0;
      return hasBlocks || hasTasks;
    });
  }, [days, blocksByDate, tasksByDate]);

  const loading = (range === "two-weeks" && loadingBlocks2) || loadingTasks;

  const handleToggleTask = useCallback(
    (task: Task) => {
      updateTask(task.id, { completed: task.completed ? 0 : 1 });
    },
    [updateTask]
  );

  function formatDayHeader(day: Date): { label: string; isSpecial: boolean } {
    if (isToday(day)) {
      return {
        label: `TODAY \u2014 ${format(day, "EEE, MMM d")}`,
        isSpecial: true,
      };
    }
    if (isTomorrow(day)) {
      return {
        label: `TOMORROW \u2014 ${format(day, "EEE, MMM d")}`,
        isSpecial: true,
      };
    }
    return { label: format(day, "EEE, MMM d"), isSpecial: false };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-stone-800">Upcoming</h2>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as "week" | "two-weeks")}
            className="text-sm border border-stone-200 rounded-md px-2 py-1 text-stone-600 bg-white focus:outline-none focus:ring-1 focus:ring-stone-300"
          >
            <option value="week">This week</option>
            <option value="two-weeks">Next 2 weeks</option>
          </select>
          <button
            onClick={onAddBlock}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-800 border border-stone-200 rounded-md px-2.5 py-1 hover:bg-stone-50 transition-colors"
          >
            <Plus size={14} />
            Add event
          </button>
        </div>
      </div>

      {/* Day sections */}
      {daysWithContent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Calendar className="w-10 h-10 mb-3 text-stone-300" />
          <p className="text-sm">Nothing planned &mdash; enjoy the calm</p>
        </div>
      ) : (
        <div>
          {daysWithContent.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayBlocks = blocksByDate[dateStr] ?? [];
            const dayTasks = tasksByDate[dateStr] ?? [];
            const { label, isSpecial } = formatDayHeader(day);

            return (
              <div key={dateStr} className="mb-6">
                {/* Day header */}
                <button
                  onClick={() => onDayClick(dateStr)}
                  className="flex items-center gap-2 pb-2 border-b border-stone-100 w-full text-left group"
                >
                  {isToday(day) && (
                    <span className="w-2 h-2 rounded-full bg-stone-800 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-stone-800 group-hover:underline">
                    {label}
                  </span>
                </button>

                {/* Events */}
                {dayBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="group/row flex items-center gap-3 py-2 px-3 hover:bg-stone-50 rounded-md transition-colors cursor-pointer"
                    onClick={() => onEditBlock(block)}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: block.category_color ?? "#a8a29e",
                      }}
                    />
                    <span className="text-xs text-stone-500 w-20 flex-shrink-0">
                      {formatHour(block.start_hour)}
                    </span>
                    <span className="text-sm text-stone-800 truncate">
                      {block.title}
                    </span>
                    {block.meeting_url && (
                      <a
                        href={block.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium ml-2 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors flex-shrink-0"
                      >
                        <Video size={13} />
                        Join
                      </a>
                    )}
                    <span className="flex-1" />
                    {block.category_name && block.category_color && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `${block.category_color}26`,
                          color: darkenColor(block.category_color),
                        }}
                      >
                        {block.category_name}
                      </span>
                    )}
                  </div>
                ))}

                {/* Tasks */}
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 py-2 px-3 hover:bg-stone-50 rounded-md transition-colors"
                  >
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="flex-shrink-0 text-stone-400 hover:text-stone-600"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-stone-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span
                      className={`text-sm flex-1 truncate ${
                        task.completed
                          ? "line-through text-stone-400"
                          : "text-stone-800"
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.category_name && task.category_color && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `${task.category_color}26`,
                          color: darkenColor(task.category_color),
                        }}
                      >
                        {task.category_name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
