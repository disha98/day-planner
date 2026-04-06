"use client";

import { Suspense } from "react";
import { LeftNav } from "@/components/layout/left-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Suspense>
        <LeftNav />
      </Suspense>
      <div className="flex flex-col flex-1 min-w-0">{children}</div>
    </div>
  );
}
