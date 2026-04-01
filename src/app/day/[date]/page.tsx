"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const DayPageClient = dynamic(
  () => import("@/components/planner/day-page-client"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center text-stone-400 text-sm">
        Loading...
      </div>
    ),
  }
);

export default function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  return <DayPageClient dateParam={date} />;
}
