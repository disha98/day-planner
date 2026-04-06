"use client";

import { useMemo } from "react";
import { format, startOfWeek } from "date-fns";
import { Clock, CalendarX2, Plus } from "lucide-react";
import { TimeBlock, Category } from "@/types";
import { useTimeBlocks } from "@/lib/hooks/use-time-blocks";
import { useTasks } from "@/lib/hooks/use-tasks";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskInput } from "@/components/tasks/task-input";
import { DailyNotes } from "@/components/notes/daily-notes";

interface DayViewProps {
  date: Date;
  categories: Category[];
  onEditBlock: (block: TimeBlock) => void;
  onAddBlock: () => void;
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${period}`;
}

export function DayView({ date, categories, onEditBlock, onAddBlock }: DayViewProps) {
  const dateStr = format(date, "yyyy-MM-dd");
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, "yyyy-MM-dd");

  const { blocks, loading: blocksLoading } = useTimeBlocks(weekStartStr);
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks(dateStr);

  const dayBlocks = useMemo(() => {
    return blocks
      .filter((b) => b.date === dateStr)
      .sort((a, b) => a.start_hour - b.start_hour);
  }, [blocks, dateStr]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.sort_order - b.sort_order);
  }, [tasks]);

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      updateTask(id, { completed: task.completed ? 0 : 1 });
    }
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  return (
    <div className="flex gap-8 p-6 max-w-5xl mx-auto">
      {/* Left column — Schedule */}
      <div className="flex-1 max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-400" />
            <h2 className="text-base font-semibold text-stone-800">Schedule</h2>
            {!blocksLoading && dayBlocks.length > 0 && (
              <span className="text-xs text-stone-400 tabular-nums">
                {dayBlocks.length}
              </span>
            )}
          </div>
        </div>

        {blocksLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-stone-400">Loading...</span>
          </div>
        ) : dayBlocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-stone-400">
            <CalendarX2 className="w-8 h-8 mb-2" />
            <span className="text-sm">No events scheduled</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dayBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => onEditBlock(block)}
                className="flex items-stretch rounded-lg border border-stone-200 bg-white hover:shadow-sm transition-shadow duration-150 cursor-pointer text-left"
              >
                {/* Color bar */}
                <div
                  className="w-[3px] rounded-l-lg flex-shrink-0"
                  style={{
                    backgroundColor: block.category_color || "#a8a29e",
                  }}
                />

                {/* Content */}
                <div className="px-4 py-3 flex-1 min-w-0">
                  <p className="text-xs text-stone-500">
                    {formatHour(block.start_hour)} &ndash; {formatHour(block.end_hour)}
                  </p>
                  <p className="text-sm font-medium text-stone-800 mt-0.5 truncate">
                    {block.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {block.category_name && (
                      <span
                        className="inline-block text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: block.category_color
                            ? `${block.category_color}18`
                            : "#f5f5f4",
                          color: block.category_color || "#78716c",
                        }}
                      >
                        {block.category_name}
                      </span>
                    )}
                    {block.meeting_url && (
                      <a
                        href={block.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Join meeting
                      </a>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Add event button */}
        <button
          onClick={onAddBlock}
          className="flex items-center gap-1.5 mt-3 px-2 py-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors duration-150"
        >
          <Plus className="w-4 h-4" />
          Add event
        </button>
      </div>

      {/* Right column — Tasks & Notes */}
      <div className="w-80 flex-shrink-0">
        {/* Tasks section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold text-stone-800">Tasks</h2>
            {!tasksLoading && sortedTasks.length > 0 && (
              <span className="text-xs text-stone-400 tabular-nums">
                {sortedTasks.length}
              </span>
            )}
          </div>

          {tasksLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-stone-400">Loading...</span>
            </div>
          ) : sortedTasks.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 px-2">No tasks for today</p>
          ) : (
            <div className="flex flex-col">
              {sortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          <TaskInput
            onAdd={createTask}
            categories={categories}
            selectedDate={dateStr}
          />
        </div>

        {/* Notes section */}
        <div className="mt-6">
          <DailyNotes selectedDate={dateStr} />
        </div>
      </div>
    </div>
  );
}
