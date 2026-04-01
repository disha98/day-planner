"use client";

import { useState, useRef, useCallback } from "react";
import { useCategories } from "@/lib/hooks/use-categories";
import db from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Check, X, Download, Upload } from "lucide-react";
import { Category } from "@/types";

export function SettingsView() {
  const { categories, loading, refetch } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6B7280");

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await db.categories.update(editingId, { name: editName.trim(), color: editColor });
    cancelEdit();
    refetch();
  };

  const deleteCategory = async (id: string) => {
    await db.categories.delete(id);
    refetch();
  };

  const addCategory = async () => {
    if (!newName.trim()) return;
    await db.categories.add({
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: newColor,
      created_at: new Date().toISOString(),
    });
    setNewName("");
    setNewColor("#6B7280");
    setAdding(false);
    refetch();
  };

  const importRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState("");

  const exportData = useCallback(async () => {
    const data = {
      categories: await db.categories.toArray(),
      time_blocks: await db.time_blocks.toArray(),
      tasks: await db.tasks.toArray(),
      daily_notes: await db.daily_notes.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `day-planner-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      await db.transaction("rw", [db.categories, db.time_blocks, db.tasks, db.daily_notes], async () => {
        if (data.categories?.length) {
          await db.categories.clear();
          await db.categories.bulkAdd(data.categories);
        }
        if (data.time_blocks?.length) {
          await db.time_blocks.clear();
          await db.time_blocks.bulkAdd(data.time_blocks);
        }
        if (data.tasks?.length) {
          await db.tasks.clear();
          await db.tasks.bulkAdd(data.tasks);
        }
        if (data.daily_notes?.length) {
          await db.daily_notes.clear();
          await db.daily_notes.bulkAdd(data.daily_notes);
        }
      });

      setImportStatus(`Imported ${data.categories?.length || 0} categories, ${data.time_blocks?.length || 0} events, ${data.tasks?.length || 0} tasks, ${data.daily_notes?.length || 0} notes`);
      refetch();
    } catch {
      setImportStatus("Failed to import — invalid file format.");
    }
    if (importRef.current) importRef.current.value = "";
  }, [refetch]);

  if (loading) {
    return (
      <div className="p-8 text-stone-400 text-sm">Loading settings...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-lg font-semibold text-stone-800 mb-1">Settings</h2>
      <p className="text-sm text-stone-500 mb-8">
        Manage your categories and event types.
      </p>

      {/* Categories Section */}
      <div className="bg-white rounded-lg border border-stone-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div>
            <h3 className="text-sm font-semibold text-stone-800">Categories</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Color-code your events and tasks
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setAdding(true)}
          >
            <Plus size={14} />
            Add
          </Button>
        </div>

        <div className="divide-y divide-stone-100">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-5 py-3 group hover:bg-stone-50 transition-colors"
            >
              {editingId === cat.id ? (
                <>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-stone-200"
                  />
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 text-sm px-2 py-1 rounded border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="p-1.5 rounded-md text-green-600 hover:bg-green-50"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 rounded-md text-stone-400 hover:bg-stone-100"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 text-sm text-stone-800">
                    {cat.name}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {cat.color}
                  </span>
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1.5 rounded-md text-stone-300 hover:text-stone-600 hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 rounded-md text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}

          {/* Add new category row */}
          {adding && (
            <div className="flex items-center gap-3 px-5 py-3 bg-stone-50">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-stone-200"
              />
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCategory();
                  if (e.key === "Escape") {
                    setAdding(false);
                    setNewName("");
                  }
                }}
                placeholder="Category name"
                className="flex-1 text-sm px-2 py-1 rounded border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={addCategory}
                className="p-1.5 rounded-md text-green-600 hover:bg-green-50"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewName("");
                }}
                className="p-1.5 rounded-md text-stone-400 hover:bg-stone-100"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {categories.length === 0 && !adding && (
            <div className="px-5 py-8 text-center text-sm text-stone-400">
              No categories yet. Add one to get started.
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg border border-stone-200 mt-6">
        <div className="px-5 py-4 border-b border-stone-200">
          <h3 className="text-sm font-semibold text-stone-800">Data</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Export or import all your planner data as JSON
          </p>
        </div>
        <div className="px-5 py-4 flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={exportData}>
            <Download size={14} />
            Export All Data
          </Button>
          <Button variant="secondary" size="sm" onClick={() => importRef.current?.click()}>
            <Upload size={14} />
            Import Data
          </Button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
          />
        </div>
        {importStatus && (
          <div className="px-5 pb-4">
            <p className="text-sm text-green-600">{importStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}
