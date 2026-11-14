import type { Metadata } from "next";
import { ExportScreen } from "@/features/export";

export const metadata: Metadata = { title: "Export" };

export default function Page() {
  return <ExportScreen />;
}
