import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/layout/site-nav";

export const metadata: Metadata = {
  title: "EduOofa - College Admissions Platform",
  description: "Discover, compare, shortlist, and apply to colleges with lead-first counseling workflows."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
