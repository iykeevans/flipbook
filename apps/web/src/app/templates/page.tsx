import type { Metadata } from "next";
import { TemplatesScreen } from "@/features/templates";

export const metadata: Metadata = { title: "Templates" };

export default function Page() {
  return <TemplatesScreen />;
}
