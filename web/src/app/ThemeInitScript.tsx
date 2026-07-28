import Script from "next/script";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const INIT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"&&t!=="system")t="system";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","system");}})();`;

export function ThemeInitScript() {
  return <Script id="lumen-theme-init" strategy="beforeInteractive">{INIT}</Script>;
}
