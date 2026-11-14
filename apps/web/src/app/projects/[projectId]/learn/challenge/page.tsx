import type { Metadata } from "next";
import { ChallengeScreen } from "@/features/challenge";

export const metadata: Metadata = { title: "Challenge" };

export default function Page() {
  return <ChallengeScreen />;
}
