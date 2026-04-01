"use client";

import { useState, useEffect, useCallback } from "react";
import { addDays, format } from "date-fns";
import db from "@/lib/db";
import { TimeBlock } from "@/types";

export function useTimeBlocks(weekStart: string) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocks = useCallback(async () => {
    if (!weekStart) { setLoading(false); return; }
    setLoading(true);
    const weekEnd = format(addDays(new Date(weekStart), 6), "yyyy-MM-dd");

    const rows = await db.time_blocks
      .where("date")
      .between(weekStart, weekEnd, true, true)
      .sortBy("start_hour");

    const categories = await db.categories.toArray();
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const enriched: TimeBlock[] = rows.map((r) => {
      const cat = r.category_id ? catMap.get(r.category_id) : null;
      return {
        ...r,
        category_name: cat?.name ?? null,
        category_color: cat?.color ?? null,
      };
    });

    setBlocks(enriched);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const createBlock = useCallback(async (data: {
    title: string;
    description?: string;
    date: string;
    start_hour: number;
    end_hour: number;
    category_id?: string;
  }) => {
    const now = new Date().toISOString();
    const record = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || null,
      date: data.date,
      start_hour: data.start_hour,
      end_hour: data.end_hour,
      category_id: data.category_id || null,
      created_at: now,
      updated_at: now,
    };
    await db.time_blocks.add(record);
    await fetchBlocks();
    return record;
  }, [fetchBlocks]);

  const updateBlock = useCallback(async (id: string, data: Partial<TimeBlock>) => {
    await db.time_blocks.update(id, { ...data, updated_at: new Date().toISOString() });
    await fetchBlocks();
  }, [fetchBlocks]);

  const deleteBlock = useCallback(async (id: string) => {
    await db.time_blocks.delete(id);
    await fetchBlocks();
  }, [fetchBlocks]);

  return { blocks, loading, createBlock, updateBlock, deleteBlock, refetch: fetchBlocks };
}
