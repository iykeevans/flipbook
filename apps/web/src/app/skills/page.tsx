import type { Metadata } from "next";
import { SkillsScreen } from "@/features/skills";

export const metadata: Metadata = { title: "Your skills" };

export default function Page() {
  return <SkillsScreen />;
}
