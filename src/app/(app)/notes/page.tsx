"use client";

import dynamic from "next/dynamic";

const NotesView = dynamic(
  () => import("@/components/notes/notes-view").then((m) => ({ default: m.NotesView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center text-stone-400 text-sm">
        Loading...
      </div>
    ),
  }
);

export default function NotesPage() {
  return <NotesView />;
}
