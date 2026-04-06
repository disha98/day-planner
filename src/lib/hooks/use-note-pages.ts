"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import db from "@/lib/db";
import { NotePage } from "@/types";

export function useNotePages(sectionId: string | null) {
  const [pages, setPages] = useState<NotePage[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const refetch = useCallback(async () => {
    if (!sectionId) {
      setPages([]);
      setLoading(false);
      return;
    }
    const rows = await db.note_pages
      .where("section_id")
      .equals(sectionId)
      .sortBy("sort_order");
    setPages(rows);
    setLoading(false);
  }, [sectionId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createPage = useCallback(async (title: string = "Untitled") => {
    if (!sectionId) return null;
    const maxOrder = await db.note_pages
      .where("section_id")
      .equals(sectionId)
      .last();
    const now = new Date().toISOString();
    const record = {
      id: crypto.randomUUID(),
      section_id: sectionId,
      title,
      content: "",
      sort_order: (maxOrder?.sort_order ?? -1) + 1,
      created_at: now,
      updated_at: now,
    };
    await db.note_pages.add(record);
    await refetch();
    return record;
  }, [sectionId, refetch]);

  const updatePage = useCallback(async (id: string, data: { title?: string; content?: string }) => {
    await db.note_pages.update(id, { ...data, updated_at: new Date().toISOString() });
    await refetch();
  }, [refetch]);

  const updatePageDebounced = useCallback((id: string, data: { title?: string; content?: string }) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await db.note_pages.update(id, { ...data, updated_at: new Date().toISOString() });
      await refetch();
    }, 500);
  }, [refetch]);

  const deletePage = useCallback(async (id: string) => {
    await db.note_pages.delete(id);
    await refetch();
  }, [refetch]);

  return { pages, loading, createPage, updatePage, updatePageDebounced, deletePage, refetch };
}
