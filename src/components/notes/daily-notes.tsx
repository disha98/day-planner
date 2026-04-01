"use client";

import { useState, useRef, useEffect } from "react";
import { useDailyNote } from "@/lib/hooks/use-daily-note";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";

interface DailyNotesProps {
  selectedDate: string;
}

export function DailyNotes({ selectedDate }: DailyNotesProps) {
  const { content, loading, updateContent } = useDailyNote(selectedDate);
  const [isOpen, setIsOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="border-t border-stone-200">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        )}
        <FileText className="w-4 h-4 text-stone-500" />
        <span className="text-sm font-semibold text-stone-800">Notes</span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-xs text-stone-400">Loading notes...</span>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-md border border-stone-200 p-3">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Write your notes for the day..."
                className="w-full bg-transparent text-sm text-stone-700 placeholder:text-stone-400 outline-none resize-none leading-relaxed min-h-[80px]"
                rows={3}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
