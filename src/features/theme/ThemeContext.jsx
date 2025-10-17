import React, { createContext, useContext, useState, useEffect } from "react";
import { themes } from "./themes";

// 1. Create the context
const ThemeContext = createContext();

// 2. Create the Provider component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("light");
  const theme = themes[currentTheme];

  // Apply CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--card-bg", theme.cardBg);
    root.style.setProperty("--card-border", theme.cardBorder);
    root.style.setProperty("--text-primary", theme.textPrimary);
    root.style.setProperty("--text-secondary", theme.textSecondary);
    root.style.setProperty("--button-bg", theme.buttonBg);
    root.style.setProperty("--button-bg-hover", theme.buttonBgHover);
    root.style.setProperty("--button-text", theme.buttonText);
    root.style.setProperty("--button-secondary-bg", theme.buttonSecondaryBg);
    root.style.setProperty(
      "--button-secondary-bg-hover",
      theme.buttonSecondaryBgHover
    );
    root.style.setProperty(
      "--button-secondary-text",
      theme.buttonSecondaryText
    );
    root.style.setProperty("--input-bg", theme.inputBg);
    root.style.setProperty("--input-border", theme.inputBorder);
    root.style.setProperty("--input-text", theme.inputText);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--divider", theme.divider);
  }, [theme]);

  const value = {
    theme,
    currentTheme,
    setCurrentTheme,
    themes: Object.keys(themes),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// 3. Create the custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext);

  // This check provides a helpful error for other developers
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
