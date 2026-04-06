# Day Planner

A Notion-style weekly day planner for organizing your time blocks, tasks, and notes. All data is stored locally in your browser using IndexedDB — nothing is sent to a server.

**Live demo:** [day-planner-phi.vercel.app](https://day-planner-phi.vercel.app/)

## Features

- **Weekly Grid** — Visual calendar view with draggable time blocks
- **Day View** — Hour-by-hour breakdown of a single day
- **List View** — Upcoming events and tasks in a scrollable list
- **To-Do** — Task management with priorities (high/medium/low) and completion tracking
- **Notes** — Organize notes into sections and pages, with auto-saving
- **Categories** — Color-coded categories to tag time blocks and tasks
- **Calendar Import** — Import `.ics` files from Google Calendar, Apple Calendar, or Outlook
- **Backup & Restore** — Export all data as JSON, import it back anytime
- **Meeting URLs** — Automatically extracts Zoom, Google Meet, Teams, and WebEx links from imported events
- **Drag & Drop** — Reorder tasks and time blocks with @dnd-kit

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Dexie](https://dexie.org/) (IndexedDB wrapper)
- [ical.js](https://github.com/kewisch/ical.js) (calendar parsing)
- [date-fns](https://date-fns.org/) (date utilities)
- [@dnd-kit](https://dndkit.com/) (drag and drop)
- [Lucide](https://lucide.dev/) (icons)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Sample Data

The `samples/` directory contains test files for trying out the import feature:

- **`sample-calendar.ics`** — 13 calendar events across a week, including recurring standups, meetings with video call URLs, and an all-day event
- **`sample-backup.json`** — Full backup with 3 categories, 7 time blocks, 5 tasks, 2 daily notes, and 2 note pages

To test:

1. Go to **Import** in the sidebar
2. Choose **Calendar (.ics)** or **Backup (.json)**
3. Upload the corresponding sample file from `samples/`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                  # Pages & API routes
├── components/
│   ├── layout/           # Header, sidebar navigation
│   ├── planner/          # Weekly grid, day view, time blocks, modals
│   ├── tasks/            # Task list, priority badges
│   ├── notes/            # Sections, pages, editor
│   ├── import/           # Calendar & backup import
│   ├── settings/         # Category management, data export
│   └── ui/               # Shared primitives (button, modal, input, select)
├── lib/
│   ├── db.ts             # Dexie database schema
│   └── hooks/            # React hooks for data access
└── types/                # TypeScript interfaces
samples/
├── sample-calendar.ics   # Test .ics file for calendar import
└── sample-backup.json    # Test backup file for restore
```
