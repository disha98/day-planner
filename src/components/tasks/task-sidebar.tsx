"use client";

import { useState } from "react";
import { Category } from "@/types";
import { useTasks } from "@/lib/hooks/use-tasks";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskInput } from "@/components/tasks/task-input";
import { ChevronDown, ChevronRight, ListTodo } from "lucide-react";

interface TaskSidebarProps {
  selectedDate: string | null;
  categories: Category[];
}

const sections = [
  { priority: "high" as const, label: "High", accent: "border-red-400", dot: "bg-red-500" },
  { priority: "medium" as const, label: "Medium", accent: "border-amber-400", dot: "bg-amber-500" },
  { priority: "low" as const, label: "Low", accent: "border-blue-400", dot: "bg-blue-500" },
];

export function TaskSidebar({ selectedDate, categories }: TaskSidebarProps) {
  const [filter, setFilter] = useState<"all" | "today">("all");
  const dateFilter = filter === "today" && selectedDate ? selectedDate : undefined;
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks(dateFilter);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (priority: string) => {
    setCollapsed((prev) => ({ ...prev, [priority]: !prev[priority] }));
  };

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      updateTask(id, { completed: task.completed === 1 ? 0 : 1 });
    }
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  const handleAdd = (data: {
    title: string;
    priority?: string;
    date?: string;
    category_id?: string;
  }) => {
    createTask(data);
  };

  const groupedTasks = {
    high: tasks.filter((t) => t.priority === "high"),
    medium: tasks.filter((t) => t.priority === "medium"),
    low: tasks.filter((t) => t.priority === "low"),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-800">Tasks</h2>
          <span className="text-xs text-stone-400 tabular-nums">
            {tasks.length}
          </span>
        </div>

        {/* Filter toggle */}
        {selectedDate && (
          <div className="flex items-center bg-stone-100 rounded-md p-0.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                filter === "all"
                  ? "bg-white text-stone-800 shadow-sm font-medium"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("today")}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                filter === "today"
                  ? "bg-white text-stone-800 shadow-sm font-medium"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Today
            </button>
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-xs text-stone-400">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-xs text-stone-400">No tasks yet</span>
          </div>
        ) : (
          <div className="space-y-1">
            {sections.map(({ priority, label, accent, dot }) => {
              const sectionTasks = groupedTasks[priority];
              if (sectionTasks.length === 0) return null;

              const isCollapsed = collapsed[priority];

              return (
                <div key={priority} className={`border-l-2 ${accent} rounded-r-md`}>
                  <button
                    onClick={() => toggleCollapse(priority)}
                    className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-left hover:bg-stone-50 transition-colors rounded-r-md"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-stone-400" />
                    )}
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    <span className="text-xs font-medium text-stone-600">
                      {label}
                    </span>
                    <span className="text-xs text-stone-400 tabular-nums">
                      {sectionTasks.length}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="pl-2 pb-1">
                      {sectionTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={handleToggle}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input at bottom */}
      <div className="border-t border-stone-200 px-2 py-1.5">
        <TaskInput
          onAdd={handleAdd}
          categories={categories}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
