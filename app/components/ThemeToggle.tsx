"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<string>("system");

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("venus.theme");
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      setTheme("system");
      applyTheme("system");
    }
  }, []);

  const applyTheme = (val: string) => {
    const root = document.documentElement;
    if (val === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (val === "light") {
      root.removeAttribute("data-theme");
    } else {
      // system: remove explicit attr and let prefers-color-scheme drive it
      root.removeAttribute("data-theme");
    }
  };

  const cycle = () => {
    const order = ["system", "light", "dark"] as const;
    const idx = order.indexOf(theme as any);
    const next = order[(idx + 1) % order.length];
    setTheme(next);
    localStorage.setItem("venus.theme", next);
    applyTheme(next);
  };

  // Prevent hydration mismatch by rendering a placeholder until mounted on client
  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-slate-300/60 bg-white/70 px-3 py-1.5 text-sm">
        <span>🌓</span>
        <span>Loading...</span>
      </div>
    );
  }

  const label = theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System";
  const icon = theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🖥️";

  return (
    <button
      onClick={cycle}
      aria-label={`Toggle theme (current: ${label})`}
      title={`Toggle theme (current: ${label})`}
      className="inline-flex items-center gap-2 rounded-md border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/10 px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-white/20 transition-colors duration-200"
    >
      <span className="i-theme" aria-hidden>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
