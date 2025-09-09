"use client";

import { useEffect } from "react";
import { ToastProvider } from "@/app/components/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Initialize theme on client side
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("venus.theme");
    const root = document.documentElement;

    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
