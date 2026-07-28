"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";
import {
  getThemeServerSnapshot,
  getThemeSnapshot,
  setThemePreference,
  subscribeTheme,
  type ThemePreference,
} from "@/lib/theme";

const NAV: { href: string; label: string; match: (path: string) => boolean }[] =
  [
    { href: "/", label: "Checker", match: (path) => path === "/" },
    {
      href: "/batch",
      label: "Batch results",
      match: (path) => path === "/batch" || path.startsWith("/batch/"),
    },
  ];

const THEMES: { id: ThemePreference; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const onThemeChange = useCallback((next: ThemePreference) => {
    setThemePreference(next);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          <span className="site-logo-mark" aria-hidden="true">
            L
          </span>
          <span className="site-logo-text">Lumen</span>
        </Link>
        <div className="site-header-actions">
          <nav className="site-nav" aria-label="Main">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`site-nav-link${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div
            className="theme-switcher"
            role="group"
            aria-label="Color theme"
          >
            {THEMES.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`theme-switcher-btn${
                  theme === option.id ? " is-active" : ""
                }`}
                aria-pressed={theme === option.id}
                onClick={() => onThemeChange(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
