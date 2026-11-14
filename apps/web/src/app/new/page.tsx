import type { Metadata } from "next";
import { NewProjectScreen } from "@/features/new-project";

export const metadata: Metadata = { title: "New project" };

export default function Page() {
  return <NewProjectScreen />;
}
