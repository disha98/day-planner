"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";

const TodoView = dynamic(
  () => import("@/components/todos/todo-view").then((m) => ({ default: m.TodoView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
        Loading...
      </div>
    ),
  }
);

export default function TodosPage() {
  return (
    <>
      <Header title="To-Do" />
      <div className="flex-1 overflow-auto">
        <TodoView />
      </div>
    </>
  );
}
