import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "JobNet Worldwide | AI-Powered Global & Remote Job Search Platform",
  description: "Discover verified high-growth opportunities, remote career listings, and federal roles worldwide with real-time multi-provider aggregation and PostgreSQL caching.",
  keywords: ["job search", "remote jobs", "worldwide careers", "tech hiring", "software engineer", "usajobs", "adzuna", "nextjs 15"],
  authors: [{ name: "Antigravity Engineering Team" }],
  openGraph: {
    title: "JobNet Worldwide Platform",
    description: "AI-powered global tech, executive, and public sector career aggregation engine.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-purple-600 selection:text-white min-h-screen flex flex-col`}
      >
        <div className="flex-1 w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
