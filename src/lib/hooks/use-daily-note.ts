"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import db from "@/lib/db";

export function useDailyNote(date: string) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const fetchNote = useCallback(async () => {
    setLoading(true);
    const note = await db.daily_notes.where("date").equals(date).first();
    setContent(note?.content || "");
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const existing = await db.daily_notes.where("date").equals(date).first();
        const now = new Date().toISOString();
        if (existing) {
          await db.daily_notes.update(existing.id, {
            content: newContent,
            updated_at: now,
          });
        } else {
          await db.daily_notes.add({
            id: crypto.randomUUID(),
            date,
            content: newContent,
            created_at: now,
            updated_at: now,
          });
        }
      }, 500);
    },
    [date]
  );

  return { content, loading, updateContent };
}
