@AGENTS.md

# Day Planner

A Notion-style weekly day planner for organizing time blocks, tasks, and notes. All data is stored client-side in the browser using IndexedDB via Dexie — no server-side database or API routes.

## Tech Stack

- **Framework**: Next.js 16.2.2 (App Router)
- **UI**: React 19, Tailwind CSS 4, Lucide icons
- **Database**: IndexedDB via Dexie (client-side, browser storage)
- **Calendar Parsing**: ical.js
- **Drag & Drop**: @dnd-kit
- **Date Utilities**: date-fns

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Inter font, html shell)
│   ├── page.tsx                # Home — redirects to /planner
│   ├── globals.css             # Global styles
│   └── (app)/                  # Route group with shared sidebar layout
│       ├── layout.tsx          # Shared layout (LeftNav + content area)
│       ├── planner/page.tsx    # List / Day / Week sub-views (via ?view= param)
│       ├── notes/page.tsx      # Notes (sections + pages)
│       ├── todos/page.tsx      # To-Do list
│       ├── import/page.tsx     # Calendar (.ics) & backup (.json) import
│       ├── settings/page.tsx   # Category management, data export
│       └── day/[date]/page.tsx # Dynamic day detail (e.g. /day/2026-04-10)
├── components/
│   ├── layout/           # Header, LeftNav (Link-based sidebar navigation)
│   ├── planner/          # Weekly grid, day view, list view, time block cards/modals, day-page-client
│   ├── tasks/            # Task items, priority badge
│   ├── todos/            # Todo view, todo input
│   ├── notes/            # Sections panel, pages panel, note editor
│   ├── import/           # Calendar & backup import view
│   ├── settings/         # Category management, data export
│   └── ui/               # Shared primitives (button, modal, input, select)
├── lib/
│   ├── db.ts             # Dexie database schema & initialization
│   ├── hooks/            # React hooks (use-tasks, use-time-blocks, use-categories, use-note-sections, use-note-pages)
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript interfaces (Category, TimeBlock, Task, NoteSection, NotePage, DailyNote)
samples/
├── sample-calendar.ics   # Test .ics file for calendar import
└── sample-backup.json    # Test backup file for restore
```

## Routes

| Route | Description |
|-------|-------------|
| `/planner` | Main planner — List view (default) |
| `/planner?view=calendar` | Weekly calendar grid with draggable time blocks |
| `/planner?view=day` | Single-day view with hour-by-hour breakdown |
| `/notes` | Notes organized into sections and pages |
| `/todos` | Task management with priorities and categories |
| `/import` | Import .ics calendar files or restore JSON backup |
| `/settings` | Manage categories and export data |
| `/day/[date]` | Dynamic route — detailed day view for a specific date |

All routes under `(app)/` share a layout with the `LeftNav` sidebar.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Data Model

All data lives in IndexedDB via Dexie (`src/lib/db.ts`). Tables:

- **categories** — id, name, color, created_at
- **time_blocks** — id, title, description, meeting_url, date, start_hour, end_hour, category_id, timestamps
- **tasks** — id, title, completed, priority (high/medium/low), date, sort_order, category_id, timestamps
- **note_sections** — id, name, sort_order, created_at
- **note_pages** — id, section_id, title, content, sort_order, timestamps
- **daily_notes** — id, date, content, timestamps

## Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Key Patterns

- The `(app)` route group provides a shared layout with `LeftNav` across all pages
- Planner sub-views (list/day/calendar) share state (week navigation, time block modal) so they stay within `/planner` as a `?view=` query param
- `LeftNav` uses Next.js `Link` + `usePathname`/`useSearchParams` for navigation and active state
- All page components use `dynamic()` with `ssr: false` since Dexie requires browser APIs
- The weekly grid displays hours 6 AM–10 PM (`START_HOUR=6`, `END_HOUR=22` in day-column.tsx)
