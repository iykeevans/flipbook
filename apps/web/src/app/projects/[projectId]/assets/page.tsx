import type { Metadata } from "next";
import { AssetsScreen } from "@/features/assets";

export const metadata: Metadata = { title: "Assets" };

export default function Page() {
  return <AssetsScreen />;
}
