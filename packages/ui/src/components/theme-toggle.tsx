import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState, type ReactElement } from "react";

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const cached = localStorage.getItem("theme");
  if (cached === "light" || cached === "dark") return cached;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
};

export function ThemeToggle(): ReactElement {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="切换主题"
      className="border-0 transition-none"
      onClick={toggleTheme}
      aria-pressed={theme === "dark"}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
