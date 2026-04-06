"use client";

import { useState, useCallback } from "react";
import { startOfWeek, format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LeftNav } from "@/components/layout/left-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { WeeklyGrid } from "@/components/planner/weekly-grid";
import { ListView } from "@/components/planner/list-view";
import { DayView } from "@/components/planner/day-view";
import { DateNavigator } from "@/components/planner/date-navigator";
import { DayNavigator } from "@/components/planner/day-navigator";
import { TimeBlockModal } from "@/components/planner/time-block-modal";
import { useTimeBlocks } from "@/lib/hooks/use-time-blocks";
import { useCategories } from "@/lib/hooks/use-categories";
import { SettingsView } from "@/components/settings/settings-view";
import { ImportView } from "@/components/import/import-view";
import { NotesView } from "@/components/notes/notes-view";
import { TodoView } from "@/components/todos/todo-view";
import { TimeBlock } from "@/types";

type ViewType = "calendar" | "list" | "day" | "notes" | "todos" | "import" | "settings";

export default function PlannerClient() {
  const now = new Date();
  const [activeView, setActiveView] = useState<ViewType>("list");
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(now, { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    format(now, "yyyy-MM-dd")
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [slotDate, setSlotDate] = useState("");
  const [slotHour, setSlotHour] = useState<number | undefined>();

  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const { blocks, createBlock, updateBlock, deleteBlock } = useTimeBlocks(weekStartStr);
  const { categories } = useCategories();

  const handleSlotClick = useCallback((date: string, hour: number) => {
    setEditingBlock(null);
    setSlotDate(date);
    setSlotHour(hour);
    setModalOpen(true);
  }, []);

  const handleBlockClick = useCallback((block: TimeBlock) => {
    setEditingBlock(block);
    setSlotDate(block.date);
    setSlotHour(undefined);
    setModalOpen(true);
  }, []);

  const handleAddBlock = useCallback(() => {
    setEditingBlock(null);
    setSlotDate(selectedDate);
    setSlotHour(undefined);
    setModalOpen(true);
  }, [selectedDate]);

  const handleSave = useCallback(
    async (data: {
      title: string;
      description?: string;
      meeting_url?: string;
      date: string;
      start_hour: number;
      end_hour: number;
      category_id?: string;
    }) => {
      if (editingBlock) {
        await updateBlock(editingBlock.id, data);
      } else {
        await createBlock(data);
      }
      setModalOpen(false);
    },
    [editingBlock, updateBlock, createBlock]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteBlock(id);
      setModalOpen(false);
    },
    [deleteBlock]
  );

  const router = useRouter();

  const handleDayClick = useCallback((dateStr: string) => {
    router.push(`/day/${dateStr}`);
  }, [router]);

  const handleDayDateChange = useCallback((date: Date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
  }, []);

  const selectedDateObj = parseISO(selectedDate);

  return (
    <div className="flex h-screen">
      <LeftNav activeView={activeView} onViewChange={setActiveView} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          title={
            activeView === "calendar" ? "Calendar" :
            activeView === "list" ? "Upcoming" :
            activeView === "day" ? "Day" :
            activeView === "notes" ? "Notes" :
            activeView === "todos" ? "To-Do" :
            activeView === "import" ? "Import" :
            activeView === "settings" ? "Settings" :
            "Day Planner"
          }
        >
          {activeView === "calendar" && (
            <DateNavigator weekStart={weekStart} onWeekChange={setWeekStart} />
          )}
          {activeView === "day" && (
            <DayNavigator
              date={selectedDateObj}
              onDateChange={handleDayDateChange}
            />
          )}
        </Header>

        <div className="flex flex-1 overflow-hidden">
          {activeView === "calendar" && (
            <>
              <div className="flex-1 overflow-auto">
                <WeeklyGrid
                  weekStart={weekStart}
                  blocks={blocks}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onSlotClick={handleSlotClick}
                  onBlockClick={handleBlockClick}
                  onUpdateBlock={updateBlock}
                />
              </div>
              <Sidebar selectedDate={selectedDate} categories={categories} />
            </>
          )}

          {activeView === "list" && (
            <div className="flex-1 overflow-auto">
              <ListView
                weekStart={weekStart}
                blocks={blocks}
                categories={categories}
                onEditBlock={handleBlockClick}
                onDayClick={handleDayClick}
              />
            </div>
          )}

          {activeView === "day" && (
            <div className="flex-1 overflow-auto">
              <DayView
                date={selectedDateObj}
                categories={categories}
                onEditBlock={handleBlockClick}
                onAddBlock={handleAddBlock}
              />
            </div>
          )}

          {activeView === "notes" && (
            <NotesView />
          )}

          {activeView === "todos" && (
            <div className="flex-1 overflow-auto">
              <TodoView />
            </div>
          )}

          {activeView === "import" && (
            <div className="flex-1 overflow-auto">
              <ImportView onComplete={() => setActiveView("list")} />
            </div>
          )}

          {activeView === "settings" && (
            <div className="flex-1 overflow-auto">
              <SettingsView />
            </div>
          )}
        </div>
      </div>

      <TimeBlockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        block={editingBlock}
        date={slotDate}
        hour={slotHour}
        categories={categories}
        onSave={handleSave}
        onDelete={editingBlock ? handleDelete : undefined}
      />
    </div>
  );
}
