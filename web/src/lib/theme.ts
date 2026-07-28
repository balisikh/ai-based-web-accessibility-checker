export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "lumen-theme";

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function applyThemePreference(theme: ThemePreference): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event("lumen-theme-change"));
}

const THEME_MEDIA = "(prefers-color-scheme: dark)";

export function subscribeTheme(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener("lumen-theme-change", onChange);
  window.addEventListener("storage", onStorage);
  const mq = window.matchMedia(THEME_MEDIA);
  mq.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("lumen-theme-change", onChange);
    window.removeEventListener("storage", onStorage);
    mq.removeEventListener("change", onChange);
  };
}

export function getThemeSnapshot(): ThemePreference {
  return readStoredTheme();
}

export function getThemeServerSnapshot(): ThemePreference {
  return "system";
}

export function setThemePreference(theme: ThemePreference): void {
  applyThemePreference(theme);
}
