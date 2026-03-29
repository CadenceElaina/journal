import React, { useEffect, useState } from "react";
import zxcvbn from "zxcvbn";

const PasswordStrengthIndicator = ({ password }) => {
  const [strength, setStrength] = useState(null);

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setStrength(result);
    } else {
      setStrength(null);
    }
  }, [password]);

  const getStrengthLabel = (score) => {
    switch (score) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const getStrengthColor = (score) => {
    switch (score) {
      case 0:
        return "#d32f2f";
      case 1:
        return "#f57c00";
      case 2:
        return "#fbc02d";
      case 3:
        return "#7cb342";
      case 4:
        return "#388e3c";
      default:
        return "#e0e0e0";
    }
  };

  if (!password || !strength) {
    return null;
  }

  const score = strength.score;
  const color = getStrengthColor(score);
  const label = getStrengthLabel(score);
  const percentage = ((score + 1) / 5) * 100;
  const isWeak = score < 3;

  return (
    <div className="password-strength-indicator">
      <div className="password-strength-bar">
        <div
          className="password-strength-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="password-strength-label" style={{ color }}>
        {label}
      </span>
      {strength.feedback.warning && (
        <p className="password-strength-warning">{strength.feedback.warning}</p>
      )}
      {strength.feedback.suggestions.length > 0 && (
        <ul className="password-strength-suggestions">
          {strength.feedback.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
