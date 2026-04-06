"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, Trash2, Plus } from "lucide-react";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useCategories } from "@/lib/hooks/use-categories";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { TodoInput } from "@/components/todos/todo-input";
import { Task } from "@/types";
import { format, parseISO } from "date-fns";

type Filter = "all" | "active" | "completed";

export function TodoView() {
  const [filter, setFilter] = useState<Filter>("all");
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const { categories } = useCategories();

  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, { name: string; color: string; tasks: Task[] }> = {};
    const uncategorized: Task[] = [];

    for (const task of filteredTasks) {
      if (task.category_id && catMap.has(task.category_id)) {
        const cat = catMap.get(task.category_id)!;
        if (!groups[task.category_id]) {
          groups[task.category_id] = { name: cat.name, color: cat.color, tasks: [] };
        }
        groups[task.category_id].tasks.push(task);
      } else {
        uncategorized.push(task);
      }
    }

    const result = Object.entries(groups)
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .map(([id, g]) => ({ id, ...g }));

    if (uncategorized.length > 0) {
      result.push({ id: "__uncategorized", name: "Uncategorized", color: "#a8a29e", tasks: uncategorized });
    }

    return result;
  }, [filteredTasks, catMap]);

  const [quickAdd, setQuickAdd] = useState("");

  const handleToggle = useCallback(
    (task: Task) => {
      updateTask(task.id, { completed: task.completed ? 0 : 1 });
    },
    [updateTask]
  );

  const handleQuickAdd = useCallback(() => {
    if (!quickAdd.trim()) return;
    createTask({ title: quickAdd.trim() });
    setQuickAdd("");
  }, [quickAdd, createTask]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-3 py-1 rounded-md capitalize transition-colors ${
                filter === f
                  ? "bg-white text-stone-800 shadow-sm font-medium"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <TodoInput categories={categories} onAdd={createTask} />
      </div>

      {/* Task groups */}
      {grouped.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm">
            {filter === "completed"
              ? "No completed tasks yet"
              : filter === "active"
              ? "All caught up!"
              : "No tasks yet. Add one to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.id}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-100">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-sm font-semibold text-stone-700">
                  {group.name}
                </span>
                <span className="text-xs text-stone-400 ml-auto">
                  {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>

              {/* Task rows */}
              <div className="space-y-0.5">
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-50 transition-colors"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(task)}
                      className={`flex-shrink-0 w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? "bg-stone-800 border-stone-800"
                          : "border-stone-300 hover:border-stone-400"
                      }`}
                    >
                      {task.completed ? (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      ) : null}
                    </button>

                    {/* Title */}
                    <span
                      className={`flex-1 text-sm truncate ${
                        task.completed
                          ? "line-through text-stone-400 opacity-60"
                          : "text-stone-800"
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Priority */}
                    <PriorityBadge priority={task.priority} />

                    {/* Date */}
                    {task.date && (
                      <span className="text-xs text-stone-400 flex-shrink-0">
                        {format(parseISO(task.date), "MMM d")}
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 p-1 rounded text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Always-visible quick add */}
      <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 bg-white hover:border-stone-300 transition-colors">
        <Plus size={16} className="text-stone-400 flex-shrink-0" />
        <input
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuickAdd();
          }}
          placeholder="Add a task..."
          className="flex-1 text-sm focus:outline-none bg-transparent placeholder:text-stone-400"
        />
      </div>
    </div>
  );
}
