"use client";

import { Category } from "@/types";
import { TaskSidebar } from "@/components/tasks/task-sidebar";
import { DailyNotes } from "@/components/notes/daily-notes";
import { Calendar } from "lucide-react";

interface SidebarProps {
  selectedDate: string | null;
  categories: Category[];
}

export function Sidebar({ selectedDate, categories }: SidebarProps) {
  return (
    <aside className="w-80 border-l border-stone-200 h-full flex flex-col bg-white overflow-y-auto custom-scrollbar">
      {selectedDate ? (
        <>
          {/* Tasks take up available space */}
          <div className="flex-1 min-h-0 flex flex-col">
            <TaskSidebar
              selectedDate={selectedDate}
              categories={categories}
            />
          </div>

          {/* Daily notes at bottom */}
          <DailyNotes selectedDate={selectedDate} />
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Calendar className="w-8 h-8 text-stone-300 mb-3" />
          <p className="text-sm text-stone-400">
            Select a day to see tasks
          </p>
        </div>
      )}
    </aside>
  );
}
