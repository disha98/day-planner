"use client";

import { useState, useEffect, useCallback } from "react";
import db from "@/lib/db";
import { Task } from "@/types";

export function useTasks(date?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    let rows;
    if (date) {
      rows = await db.tasks.where("date").equals(date).sortBy("sort_order");
    } else {
      rows = await db.tasks.orderBy("sort_order").toArray();
    }

    const categories = await db.categories.toArray();
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const enriched: Task[] = rows.map((r) => {
      const cat = r.category_id ? catMap.get(r.category_id) : null;
      return {
        ...r,
        priority: r.priority as Task["priority"],
        category_name: cat?.name ?? null,
        category_color: cat?.color ?? null,
      };
    });

    setTasks(enriched);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (data: {
    title: string;
    priority?: string;
    date?: string;
    category_id?: string;
  }) => {
    const maxOrder = await db.tasks.orderBy("sort_order").last();
    const now = new Date().toISOString();
    const record = {
      id: crypto.randomUUID(),
      title: data.title,
      completed: 0,
      priority: data.priority || "medium",
      date: data.date || null,
      sort_order: (maxOrder?.sort_order ?? -1) + 1,
      category_id: data.category_id || null,
      created_at: now,
      updated_at: now,
    };
    await db.tasks.add(record);
    await fetchTasks();
    return record;
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    await db.tasks.update(id, { ...data, updated_at: new Date().toISOString() });
    await fetchTasks();
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await db.tasks.delete(id);
    await fetchTasks();
  }, [fetchTasks]);

  const reorderTasks = useCallback(async (orderedIds: string[]) => {
    await db.transaction("rw", db.tasks, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.tasks.update(orderedIds[i], {
          sort_order: i,
          updated_at: new Date().toISOString(),
        });
      }
    });
    await fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, createTask, updateTask, deleteTask, reorderTasks, refetch: fetchTasks };
}
