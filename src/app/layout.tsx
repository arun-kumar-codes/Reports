import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: {
    default: "Reports Dashboard",
    template: "%s · Reports Dashboard",
  },
  description:
    "A small reports dashboard built with Next.js App Router, TypeScript, role-gated middleware, and AI-generated report summaries.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
