import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-display", display: "swap" });
const code = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-code", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Flipbook", template: "%s · Flipbook" },
  description: "Record a site, get working code, then learn every animation in it.",
};

export const viewport: Viewport = {
  themeColor: "#141416",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${code.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
