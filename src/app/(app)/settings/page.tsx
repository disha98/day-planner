"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";

const SettingsView = dynamic(
  () => import("@/components/settings/settings-view").then((m) => ({ default: m.SettingsView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
        Loading...
      </div>
    ),
  }
);

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 overflow-auto">
        <SettingsView />
      </div>
    </>
  );
}
