import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { themes } from "./themes";
import "./ThemeSelector.css";

const ThemeSelector = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { currentTheme, setCurrentTheme } = useTheme();
  const dropdownRef = useRef(null);

  const currentThemeData = themes[currentTheme];

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleThemeChange = (themeKey) => {
    setCurrentTheme(themeKey);
    setIsDropdownVisible(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    if (isDropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownVisible]);

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button
        className="theme-selector-button"
        onClick={toggleDropdown}
        aria-label="Select theme"
      >
        <span className="theme-icon">{currentThemeData.icon}</span>
        <span className="theme-name">{currentThemeData.name}</span>
        <span className={`dropdown-arrow ${isDropdownVisible ? "open" : ""}`}>
          ▼
        </span>
      </button>

      {isDropdownVisible && (
        <div className="theme-dropdown">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              className={`theme-option ${currentTheme === key ? "active" : ""}`}
              onClick={() => handleThemeChange(key)}
            >
              <span className="theme-option-icon">{theme.icon}</span>
              <span className="theme-option-name">{theme.name}</span>
              {currentTheme === key && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
