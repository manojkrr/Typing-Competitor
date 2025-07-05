import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { startupDatabase } from "@/lib/database/startup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Typing Competitor - Master Your Typing Speed",
  description:
    "Challenge yourself and compete with friends in real-time typing races. Improve your WPM, track your progress, and become a typing champion.",
  generator: "v0.dev",
};

// Initialize database on app startup
if (typeof window === "undefined") {
  startupDatabase().catch(console.error);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
