import type { Metadata } from "next";
import { BuildScreen } from "@/features/build";

export const metadata: Metadata = { title: "Build" };

export default function Page() {
  return <BuildScreen />;
}
