"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const Planner = dynamic(() => import("@/components/planner/planner-client"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center text-stone-400 text-sm">
      Loading...
    </div>
  ),
});

export default function PlannerPage() {
  return (
    <Suspense>
      <Planner />
    </Suspense>
  );
}
