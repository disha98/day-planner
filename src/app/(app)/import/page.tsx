"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";

const ImportView = dynamic(
  () => import("@/components/import/import-view").then((m) => ({ default: m.ImportView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
        Loading...
      </div>
    ),
  }
);

export default function ImportPage() {
  const router = useRouter();

  return (
    <>
      <Header title="Import" />
      <div className="flex-1 overflow-auto">
        <ImportView onComplete={() => router.push("/planner")} />
      </div>
    </>
  );
}
