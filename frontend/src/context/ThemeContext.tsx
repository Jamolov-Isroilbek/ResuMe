// src/context/ThemeContext.tsx
import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return savedTheme ? savedTheme === "dark" : systemDark;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider
      value={{ darkMode, toggleDarkMode: () => setDarkMode((prev) => !prev) }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
