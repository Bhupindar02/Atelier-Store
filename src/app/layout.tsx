import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientShell from "@/components/ClientShell";
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
  title: "ATELIER — Haute Couture & Contemporary Luxury",
  description: "Discover the latest ready-to-wear collections, handcrafted leather goods, and timeless accessories from Maison Atelier.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf9f7] text-[#1a1714]">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
