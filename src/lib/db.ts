import Dexie, { type EntityTable } from "dexie";

export interface CategoryRecord {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TimeBlockRecord {
  id: string;
  title: string;
  description: string | null;
  meeting_url: string | null;
  date: string;
  start_hour: number;
  end_hour: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  completed: number;
  priority: string;
  date: string | null;
  sort_order: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyNoteRecord {
  id: string;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteSectionRecord {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface NotePageRecord {
  id: string;
  section_id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const db = new Dexie("DayPlannerDB") as Dexie & {
  categories: EntityTable<CategoryRecord, "id">;
  time_blocks: EntityTable<TimeBlockRecord, "id">;
  tasks: EntityTable<TaskRecord, "id">;
  daily_notes: EntityTable<DailyNoteRecord, "id">;
  note_sections: EntityTable<NoteSectionRecord, "id">;
  note_pages: EntityTable<NotePageRecord, "id">;
};

db.version(1).stores({
  categories: "id, name",
  time_blocks: "id, date, category_id",
  tasks: "id, date, priority, sort_order, category_id",
  daily_notes: "id, &date",
});

db.version(2).stores({
  categories: "id, name",
  time_blocks: "id, date, category_id",
  tasks: "id, date, priority, sort_order, category_id",
  daily_notes: "id, &date",
}).upgrade((tx) => {
  return tx.table("time_blocks").toCollection().modify((block) => {
    if (!("meeting_url" in block)) {
      block.meeting_url = null;
    }
  });
});

db.version(3).stores({
  categories: "id, name",
  time_blocks: "id, date, category_id",
  tasks: "id, date, priority, sort_order, category_id",
  daily_notes: "id, &date",
  note_sections: "id, sort_order",
  note_pages: "id, section_id, sort_order",
});

export default db;

// Seed default categories on first use
export async function seedIfEmpty() {
  const count = await db.categories.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  await db.categories.bulkAdd([
    { id: crypto.randomUUID(), name: "Work", color: "#3B82F6", created_at: now },
    { id: crypto.randomUUID(), name: "Personal", color: "#8B5CF6", created_at: now },
    { id: crypto.randomUUID(), name: "Health", color: "#10B981", created_at: now },
    { id: crypto.randomUUID(), name: "Learning", color: "#F59E0B", created_at: now },
    { id: crypto.randomUUID(), name: "Errands", color: "#EF4444", created_at: now },
  ]);
}
