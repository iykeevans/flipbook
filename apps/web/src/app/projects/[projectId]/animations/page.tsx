import type { Metadata } from "next";
import { Suspense } from "react";
import { AnimationsScreen } from "@/features/animations";

export const metadata: Metadata = { title: "Animations" };

export default function Page() {
  return (
    <Suspense>
      <AnimationsScreen />
    </Suspense>
  );
}
