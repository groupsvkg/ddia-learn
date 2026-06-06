import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteShell } from "@/components/ddia/site-shell";
import { curriculum } from "@/lib/curriculum";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DDIA Learn — Designing Data-Intensive Applications",
  description:
    "An interactive study companion for Martin Kleppmann's Designing Data-Intensive Applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full overflow-hidden antialiased">
        <TooltipProvider>
          <SiteShell curriculum={curriculum}>{children}</SiteShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
