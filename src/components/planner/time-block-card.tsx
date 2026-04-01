"use client";

import { TimeBlock } from "@/types";

interface TimeBlockCardProps {
  block: TimeBlock;
  onClick: (block: TimeBlock) => void;
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function TimeBlockCard({ block, onClick }: TimeBlockCardProps) {
  const HOUR_HEIGHT = 56; // h-14 = 56px
  const START_HOUR = 6;

  const top = (block.start_hour - START_HOUR) * HOUR_HEIGHT;
  const height = (block.end_hour - block.start_hour) * HOUR_HEIGHT;
  const isShort = block.end_hour - block.start_hour <= 1;

  const categoryColor = block.category_color ?? "#a8a29e"; // stone-400 fallback

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(block);
      }}
      className="absolute left-8 right-1 rounded-md px-2 py-1 text-left cursor-pointer hover:shadow-md transition-shadow overflow-hidden z-10"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        borderLeft: `3px solid ${categoryColor}`,
        backgroundColor: `${categoryColor}1A`, // ~10% opacity hex
      }}
    >
      <p
        className={`text-xs font-medium text-stone-800 ${isShort ? "truncate" : ""}`}
      >
        {block.title}
      </p>
      {!isShort && (
        <p className="text-[10px] text-stone-500 mt-0.5">
          {formatHour(block.start_hour)} - {formatHour(block.end_hour)}
        </p>
      )}
    </button>
  );
}
