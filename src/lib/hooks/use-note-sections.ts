"use client";

import { useState, useEffect, useCallback } from "react";
import db from "@/lib/db";
import { NoteSection } from "@/types";

export function useNoteSections() {
  const [sections, setSections] = useState<NoteSection[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const rows = await db.note_sections.orderBy("sort_order").toArray();
    setSections(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createSection = useCallback(async (name: string) => {
    const maxOrder = await db.note_sections.orderBy("sort_order").last();
    const record = {
      id: crypto.randomUUID(),
      name,
      sort_order: (maxOrder?.sort_order ?? -1) + 1,
      created_at: new Date().toISOString(),
    };
    await db.note_sections.add(record);
    await refetch();
    return record;
  }, [refetch]);

  const renameSection = useCallback(async (id: string, name: string) => {
    await db.note_sections.update(id, { name });
    await refetch();
  }, [refetch]);

  const deleteSection = useCallback(async (id: string) => {
    await db.transaction("rw", [db.note_sections, db.note_pages], async () => {
      await db.note_pages.where("section_id").equals(id).delete();
      await db.note_sections.delete(id);
    });
    await refetch();
  }, [refetch]);

  return { sections, loading, createSection, renameSection, deleteSection, refetch };
}
