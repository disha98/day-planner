"use client";

import { Plus, Trash2, FileText } from "lucide-react";
import { NotePage } from "@/types";

interface PagesPanelProps {
  pages: NotePage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  sectionSelected: boolean;
}

export function PagesPanel({
  pages,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  sectionSelected,
}: PagesPanelProps) {
  if (!sectionSelected) {
    return (
      <div className="w-56 border-r border-stone-200 flex items-center justify-center">
        <p className="text-sm text-stone-400 px-4 text-center">
          Select a section
        </p>
      </div>
    );
  }

  return (
    <div className="w-56 border-r border-stone-200 flex flex-col">
      <div className="px-3 py-2.5 border-b border-stone-200">
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          Pages
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
        {pages.length === 0 && (
          <p className="text-sm text-stone-400 px-3 py-4 text-center">
            No pages yet
          </p>
        )}
        {pages.map((page) => (
          <div
            key={page.id}
            className={`group flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md cursor-pointer transition-colors ${
              selectedId === page.id
                ? "bg-blue-50 text-blue-700"
                : "text-stone-700 hover:bg-stone-100"
            }`}
            onClick={() => onSelect(page.id)}
          >
            <FileText size={14} className="flex-shrink-0 opacity-50" />
            <span className="text-sm truncate flex-1">
              {page.title || "Untitled"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(page.id);
              }}
              className="p-0.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="px-2 py-2 border-t border-stone-200">
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 w-full px-1 py-1 rounded hover:bg-stone-100 transition-colors"
        >
          <Plus size={14} />
          New page
        </button>
      </div>
    </div>
  );
}
