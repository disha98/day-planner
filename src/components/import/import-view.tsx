"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, ChevronDown, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import db from "@/lib/db";
import ICAL from "ical.js";

interface ImportViewProps {
  onComplete: () => void;
}

interface ParsedEvent {
  title: string;
  date: string;
  start_hour: number;
  end_hour: number;
  allDay: boolean;
  meeting_url: string | null;
}

function extractMeetingUrl(vevent: ICAL.Component): string | null {
  const location = vevent.getFirstPropertyValue("location") as string | null;
  const description = vevent.getFirstPropertyValue("description") as string | null;

  // Check LOCATION first — Zoom/Meet often put the URL there
  if (location) {
    const urlMatch = location.match(/https?:\/\/[^\s,]+/);
    if (urlMatch) return urlMatch[0];
  }

  // Fall back to DESCRIPTION
  if (description) {
    const meetingPatterns = [
      /https?:\/\/[\w.-]*zoom\.us\/[^\s\\,]+/,
      /https?:\/\/meet\.google\.com\/[^\s\\,]+/,
      /https?:\/\/teams\.microsoft\.com\/[^\s\\,]+/,
      /https?:\/\/[\w.-]*webex\.com\/[^\s\\,]+/,
    ];
    for (const pattern of meetingPatterns) {
      const match = description.match(pattern);
      if (match) return match[0];
    }
  }

  return null;
}

const instructions = [
  {
    name: "Apple Calendar",
    steps: [
      "Open the Calendar app on your Mac",
      "In the left sidebar, right-click the calendar you want to export",
      'Click "Export..."',
      "Save the .ics file to your computer",
    ],
  },
  {
    name: "Google Calendar",
    steps: [
      "Go to calendar.google.com",
      'Click the gear icon, then "Settings"',
      'Click "Import & export" in the left sidebar',
      'Click "Export" — this downloads a .zip file',
      "Unzip it to find your .ics files",
    ],
  },
  {
    name: "Outlook",
    steps: [
      "Go to outlook.live.com/calendar",
      'Click the gear icon → "View all Outlook settings"',
      "Go to Calendar → Shared calendars",
      'Under "Publish a calendar", select your calendar',
      'Click the "ICS" link to download',
    ],
  },
];

function parseICS(text: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const seen = new Set<string>();

  const jcalData = ICAL.parse(text);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents("vevent");

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    const title = event.summary || "Untitled";
    const meetingUrl = extractMeetingUrl(vevent);

    if (event.isRecurring()) {
      try {
        const iter = event.iterator();
        let count = 0;
        let next = iter.next();
        while (next && count < 100) {
          const start = next.toJSDate();
          const dur = event.duration?.toSeconds() || 3600;
          const end = new Date(start.getTime() + dur * 1000);
          addEvent(events, seen, title, start, end, meetingUrl);
          next = iter.next();
          count++;
        }
      } catch {
        const start = event.startDate?.toJSDate();
        const end = event.endDate?.toJSDate();
        if (start) addEvent(events, seen, title, start, end || new Date(start.getTime() + 3600000), meetingUrl);
      }
    } else {
      const start = event.startDate?.toJSDate();
      const end = event.endDate?.toJSDate();
      if (start) addEvent(events, seen, title, start, end || new Date(start.getTime() + 3600000), meetingUrl);
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.start_hour - b.start_hour);
}

function addEvent(events: ParsedEvent[], seen: Set<string>, title: string, start: Date, end: Date, meetingUrl: string | null = null) {
  const date = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const startHour = start.getHours();
  const endHour = end.getHours() || 24;
  const allDay = startHour === 0 && (endHour === 0 || endHour === 24) && end.getTime() - start.getTime() >= 86400000;

  const key = `${title}|${date}|${startHour}`;
  if (seen.has(key)) return;
  seen.add(key);

  events.push({
    title,
    date,
    start_hour: startHour,
    end_hour: Math.min(endHour <= startHour ? startHour + 1 : endHour, 23),
    allDay,
    meeting_url: meetingUrl,
  });
}

function formatHour(h: number) {
  if (h === 0 || h === 24) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function ImportView({ onComplete }: ImportViewProps) {
  const [mode, setMode] = useState<"calendar" | "backup">("calendar");
  const [step, setStep] = useState(1);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [skipAllDay, setSkipAllDay] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string; color: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);
  const [backupStatus, setBackupStatus] = useState("");

  useEffect(() => {
    db.categories.toArray().then(setCategories);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = parseICS(text);
      if (parsed.length === 0) {
        setError("No events found in this file.");
        return;
      }
      setEvents(parsed);
      setStep(3);
    } catch {
      setError("Failed to read or parse file.");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith(".ics")) handleFile(file);
      else setError("Please drop a .ics file.");
    },
    [handleFile]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const filteredEvents = skipAllDay ? events.filter((e) => !e.allDay) : events;

  const doImport = useCallback(async () => {
    setImporting(true);
    const now = new Date().toISOString();
    const records = filteredEvents.map((e) => ({
      id: crypto.randomUUID(),
      title: e.title,
      description: null,
      meeting_url: e.meeting_url,
      date: e.date,
      start_hour: e.start_hour,
      end_hour: e.end_hour,
      category_id: categoryId || null,
      created_at: now,
      updated_at: now,
    }));
    await db.time_blocks.bulkAdd(records);
    setImportCount(records.length);
    setImported(true);
    setImporting(false);
  }, [filteredEvents, categoryId]);

  const importBackup = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      await db.transaction("rw", [db.categories, db.time_blocks, db.tasks, db.daily_notes, db.note_sections, db.note_pages], async () => {
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
        if (data.note_sections?.length) {
          await db.note_sections.clear();
          await db.note_sections.bulkAdd(data.note_sections);
        }
        if (data.note_pages?.length) {
          await db.note_pages.clear();
          await db.note_pages.bulkAdd(data.note_pages);
        }
      });

      const total = (data.categories?.length || 0) + (data.time_blocks?.length || 0) + (data.tasks?.length || 0) + (data.daily_notes?.length || 0) + (data.note_sections?.length || 0) + (data.note_pages?.length || 0);
      setBackupStatus(`Imported ${total} items`);
    } catch {
      setBackupStatus("Failed to import — invalid file format.");
    }
    if (backupRef.current) backupRef.current.value = "";
  }, []);

  // Success state
  if (imported) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-stone-800 mb-2">
          Imported {importCount} events
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          Your calendar events are now in your planner.
        </p>
        <Button onClick={onComplete}>Go to List View</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-lg font-semibold text-stone-800 mb-1">Import</h2>
      <p className="text-sm text-stone-500 mb-6">
        Import calendar events or restore from a backup.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-8 bg-stone-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode("calendar")}
          className={`text-sm px-4 py-1.5 rounded-md transition-colors ${
            mode === "calendar"
              ? "bg-white text-stone-800 shadow-sm font-medium"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Calendar (.ics)
        </button>
        <button
          onClick={() => setMode("backup")}
          className={`text-sm px-4 py-1.5 rounded-md transition-colors ${
            mode === "backup"
              ? "bg-white text-stone-800 shadow-sm font-medium"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Backup (.json)
        </button>
      </div>

      {/* Backup import */}
      {mode === "backup" && (
        <div>
          <p className="text-sm text-stone-600 mb-4">
            Upload a JSON backup file exported from Settings to restore all your data
            (categories, events, tasks, and notes).
          </p>
          <div
            onClick={() => backupRef.current?.click()}
            className="border-2 border-dashed border-stone-200 rounded-lg p-8 text-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors"
          >
            <Upload size={24} className="mx-auto mb-2 text-stone-400" />
            <p className="text-sm text-stone-600">
              Drop .json backup file here or click to browse
            </p>
            <input
              ref={backupRef}
              type="file"
              accept=".json"
              onChange={importBackup}
              className="hidden"
            />
          </div>
          {backupStatus && (
            <p className={`mt-3 text-sm ${backupStatus.startsWith("Failed") ? "text-red-500" : "text-green-600"}`}>
              {backupStatus}
            </p>
          )}
          {backupStatus && !backupStatus.startsWith("Failed") && (
            <Button className="mt-4" onClick={onComplete}>
              Go to List View
            </Button>
          )}
        </div>
      )}

      {/* Calendar import - Step 1 */}
      {mode === "calendar" && (
      <>
      {/* Step 1 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-stone-800 text-white text-xs flex items-center justify-center font-semibold">
            1
          </span>
          <h3 className="text-sm font-semibold text-stone-800">
            Export your calendar
          </h3>
        </div>
        <p className="text-xs text-stone-500 mb-3 ml-8">
          Choose your calendar app and follow the steps to download a .ics file.
        </p>
        <div className="ml-8 space-y-1">
          {instructions.map((guide, i) => (
            <div
              key={i}
              className="border border-stone-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedGuide(expandedGuide === i ? null : i)
                }
                className="flex items-center gap-2 w-full px-4 py-2.5 text-left hover:bg-stone-50 transition-colors"
              >
                {expandedGuide === i ? (
                  <ChevronDown size={14} className="text-stone-400" />
                ) : (
                  <ChevronRight size={14} className="text-stone-400" />
                )}
                <span className="text-sm font-medium text-stone-700">
                  {guide.name}
                </span>
              </button>
              {expandedGuide === i && (
                <div className="px-4 pb-3 pt-0">
                  <ol className="list-decimal list-inside space-y-1.5 text-sm text-stone-600 ml-2">
                    {guide.steps.map((s, j) => (
                      <li key={j}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 2 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-stone-800 text-white text-xs flex items-center justify-center font-semibold">
            2
          </span>
          <h3 className="text-sm font-semibold text-stone-800">
            Upload your .ics file
          </h3>
        </div>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="ml-8 border-2 border-dashed border-stone-200 rounded-lg p-8 text-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors"
        >
          <Upload size={24} className="mx-auto mb-2 text-stone-400" />
          <p className="text-sm text-stone-600">
            {fileName || "Drop .ics file here or click to browse"}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".ics"
            onChange={onFileSelect}
            className="hidden"
          />
        </div>
        {error && (
          <p className="ml-8 mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-stone-800 text-white text-xs flex items-center justify-center font-semibold">
              3
            </span>
            <h3 className="text-sm font-semibold text-stone-800">
              Review & Import
            </h3>
          </div>
          <div className="ml-8 bg-white border border-stone-200 rounded-lg p-4">
            <p className="text-sm text-stone-700 mb-3">
              Found <strong>{filteredEvents.length}</strong> events
              {events.length !== filteredEvents.length && (
                <span className="text-stone-400">
                  {" "}
                  ({events.length - filteredEvents.length} all-day skipped)
                </span>
              )}
            </p>

            <div className="max-h-48 overflow-y-auto border border-stone-100 rounded mb-4 divide-y divide-stone-50">
              {filteredEvents.slice(0, 20).map((e, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                  <span className="text-xs text-stone-400 w-24 flex-shrink-0">
                    {e.date}
                  </span>
                  <span className="text-xs text-stone-500 w-24 flex-shrink-0">
                    {formatHour(e.start_hour)} – {formatHour(e.end_hour)}
                  </span>
                  <span className="text-stone-800 truncate">{e.title}</span>
                </div>
              ))}
              {filteredEvents.length > 20 && (
                <div className="px-3 py-2 text-xs text-stone-400">
                  ...and {filteredEvents.length - 20} more
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={skipAllDay}
                  onChange={(e) => setSkipAllDay(e.target.checked)}
                  className="rounded border-stone-300"
                />
                Skip all-day events
              </label>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <span>Category:</span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="text-sm border border-stone-200 rounded px-2 py-1 bg-white"
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={doImport}
              disabled={importing || filteredEvents.length === 0}
            >
              {importing
                ? "Importing..."
                : `Import ${filteredEvents.length} Events`}
            </Button>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
