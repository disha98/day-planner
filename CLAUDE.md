@AGENTS.md

# Day Planner

A weekly/daily planner app built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and better-sqlite3.

## Tech Stack

- **Framework**: Next.js 16.2.2 (App Router)
- **UI**: React 19, Tailwind CSS 4, Lucide icons
- **Database**: SQLite via better-sqlite3 (file: `data.db`)
- **Drag & Drop**: @dnd-kit
- **Date Utilities**: date-fns

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/              # REST API endpoints (categories, tasks, time-blocks, notes)
│   ├── planner/          # Planner page
│   ├── page.tsx          # Home page
│   └── layout.tsx        # Root layout
├── components/
│   ├── layout/           # Header, sidebar, left-nav
│   ├── planner/          # Weekly grid, day view, time blocks, modals
│   ├── tasks/            # Task sidebar, task items, input, priority badge
│   ├── notes/            # Daily notes
│   ├── settings/         # Settings view
│   └── ui/               # Shared UI primitives (button, modal, input, select)
├── lib/
│   ├── db.ts             # SQLite database connection & schema init
│   ├── hooks/            # React hooks (use-tasks, use-time-blocks, use-categories, use-daily-note)
│   └── utils.ts          # Utility functions
├── types/
│   └── index.ts          # TypeScript interfaces (Category, TimeBlock, Task, DailyNote)
scripts/
├── seed.ts               # Database seeding script
└── import-calendar.ts    # Calendar import script
```

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Database

SQLite database (`data.db`) with WAL mode and foreign keys enabled. Tables: `categories`, `time_blocks`, `tasks`, `daily_notes`. Schema is auto-initialized on first connection in `src/lib/db.ts`.

## Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json).

## API Routes

- `GET/POST /api/categories` — list/create categories
- `PUT/DELETE /api/categories/[id]` — update/delete category
- `GET/POST /api/tasks` — list/create tasks (filtered by date query param)
- `PUT/DELETE /api/tasks/[id]` — update/delete task
- `PUT /api/tasks/reorder` — reorder tasks
- `GET/POST /api/time-blocks` — list/create time blocks (filtered by date range)
- `PUT/DELETE /api/time-blocks/[id]` — update/delete time block
- `GET/PUT /api/notes` — get/save daily note (filtered by date)
