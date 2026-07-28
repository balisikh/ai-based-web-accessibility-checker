import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { SiteHeader } from "./SiteHeader";
import { ThemeInitScript } from "./ThemeInitScript";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumen | Accessibility Checker",
  description:
    "AI-based web accessibility checker: scan a URL for WCAG-oriented issues, scores, and fix guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fraunces.variable} h-full`}
      data-theme="system"
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <ThemeInitScript />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
