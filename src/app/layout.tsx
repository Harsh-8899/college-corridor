import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/layout/site-nav";
import { Providers } from "./providers";
import { WhatsAppWidget } from "@/components/layout/whatsapp-widget";

export const metadata: Metadata = {
  title: "College Corridor - College Admissions Platform",
  description: "Discover, compare, shortlist, and apply to colleges with premium counseling workflows."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteNav />
          <main>{children}</main>
          <WhatsAppWidget />
        </Providers>
      </body>
    </html>
  );
}
