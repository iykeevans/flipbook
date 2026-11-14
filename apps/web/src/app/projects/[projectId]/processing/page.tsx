import type { Metadata } from "next";
import { ProcessingScreen } from "@/features/processing";

export const metadata: Metadata = { title: "Processing" };

export default function Page() {
  return <ProcessingScreen />;
}
