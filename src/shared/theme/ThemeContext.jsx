import React, { createContext, useContext, useState, useEffect } from "react";
import { themes } from "./themes";

// 1. Create the context
const ThemeContext = createContext();

// 2. Create the Provider component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem("journal-theme");
    return saved && themes[saved] ? saved : "leather-bound";
  });
  const theme = themes[currentTheme];

  // Persist theme selection
  useEffect(() => {
    localStorage.setItem("journal-theme", currentTheme);
  }, [currentTheme]);

  // Apply CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Core colors
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
      theme.buttonSecondaryBgHover,
    );
    root.style.setProperty(
      "--button-secondary-text",
      theme.buttonSecondaryText,
    );
    root.style.setProperty("--input-bg", theme.inputBg);
    root.style.setProperty("--input-border", theme.inputBorder);
    root.style.setProperty("--input-text", theme.inputText);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--divider", theme.divider);

    // Semantic status colors
    root.style.setProperty("--success-bg", theme.successBg);
    root.style.setProperty("--success-border", theme.successBorder);
    root.style.setProperty("--success-text", theme.successText);
    root.style.setProperty("--error-bg", theme.errorBg);
    root.style.setProperty("--error-border", theme.errorBorder);
    root.style.setProperty("--error-text", theme.errorText);
    root.style.setProperty("--warning-bg", theme.warningBg);
    root.style.setProperty("--warning-border", theme.warningBorder);
    root.style.setProperty("--warning-text", theme.warningText);

    // Badge colors
    root.style.setProperty("--mood-bg", theme.moodBg);
    root.style.setProperty("--mood-border", theme.moodBorder);
    root.style.setProperty("--mood-text", theme.moodText);
    root.style.setProperty("--custom-mood-bg", theme.customMoodBg);
    root.style.setProperty("--custom-mood-border", theme.customMoodBorder);
    root.style.setProperty("--custom-mood-text", theme.customMoodText);
    root.style.setProperty("--tag-chip-bg", theme.tagChipBg);
    root.style.setProperty("--tag-chip-border", theme.tagChipBorder);
    root.style.setProperty("--tag-chip-text", theme.tagChipText);
    root.style.setProperty("--shared-badge-bg", theme.sharedBadgeBg);
    root.style.setProperty("--shared-badge-text", theme.sharedBadgeText);

    // Focus & hover
    root.style.setProperty("--focus-ring", theme.focusRing);
    root.style.setProperty("--hover-bg", theme.hoverBg);
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
