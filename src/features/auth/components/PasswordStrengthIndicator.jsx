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
      <div className={`password-strength-indicator-bar-${percentage}`}>
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            transition: "all 0.3s ease",
          }}
        />
      </div>
      <div>
        <span>{label}</span>
        {/*         
    If we require a level 3 or higher we should notify user it is a requirement
{isWeak && (
          <span
            style={{ fontSize: "11px", color: "#d32f2f", marginLeft: "8px" }}
          >
            ⚠️ Password must be "Good" or "Strong" to register
          </span>
        )} */}
        <span>{strength.feedback.warning}</span>
      </div>

      <div>
        {/* Show suggestions but don't require them */}
        {strength.feedback.suggestions.length > 0 && (
          <div className="password-strength-indicator-suggestion-list">
            {strength.feedback.suggestions.map((suggestion, index) => (
              <p key={index} className="password-strength-indicator-suggestion">
                {suggestion}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
