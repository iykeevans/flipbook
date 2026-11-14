import type { Metadata } from "next";
import { LessonScreen } from "@/features/lesson";

export const metadata: Metadata = { title: "Learn · Card stagger" };

export default function Page() {
  return <LessonScreen />;
}
