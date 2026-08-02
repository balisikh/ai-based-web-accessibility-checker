import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { SiteHeader } from "./SiteHeader";
import { ThemeInitScript } from "./ThemeInitScript";
import { rootMetadata } from "@/lib/seo";
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

export const metadata: Metadata = rootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
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
