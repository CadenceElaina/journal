import React from "react";

const OnboardingStep1 = ({ formData, handleChange }) => {
  const prefixOptions = [
    { value: "", label: "Select (optional)" },
    { value: "Dr.", label: "Dr." },
    { value: "Mr.", label: "Mr." },
    { value: "Mrs.", label: "Mrs." },
    { value: "Ms.", label: "Ms." },
    { value: "Mx.", label: "Mx." },
  ];

  return (
    <div className="onboarding-step">
      <h3>Professional Titles</h3>
      <p className="step-description">
        Add your professional prefix and credentials to help clients identify
        your qualifications.
      </p>

      <div className="form-field">
        <label htmlFor="prefix">Prefix:</label>
        <select
          id="prefix"
          name="prefix"
          value={formData.prefix}
          onChange={handleChange}
          className="form-input"
        >
          {prefixOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="suffix">Credentials/Suffix:</label>
        <input
          id="suffix"
          name="suffix"
          type="text"
          value={formData.suffix}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g., MD, DO, PsyD, PhD, LCSW, LPC"
        />
        <small className="field-hint">
          Enter your professional credentials (e.g., MD, PhD, LCSW)
        </small>
      </div>
    </div>
  );
};

export default OnboardingStep1;
