import type { Metadata } from "next";
import { ReviewScreen } from "@/features/review";

export const metadata: Metadata = { title: "Review analysis" };

export default function Page() {
  return <ReviewScreen />;
}
