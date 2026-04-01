"use client";

import { useState, useEffect, useCallback } from "react";
import db, { seedIfEmpty } from "@/lib/db";
import { Category } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    await seedIfEmpty();
    const rows = await db.categories.orderBy("name").toArray();
    setCategories(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, loading, refetch };
}
