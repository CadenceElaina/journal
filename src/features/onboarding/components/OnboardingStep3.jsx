import React from "react";

const OnboardingStep3 = ({ formData, handleBioChange }) => {
  const maxBioLength = 500;
  const currentLength = formData.providerProfile.bio.length;

  return (
    <div className="onboarding-step">
      <h3>Professional Bio</h3>
      <p className="step-description">
        Write a brief introduction to help clients get to know you and your
        practice approach.
      </p>

      <div className="form-field">
        <label htmlFor="bio">About You:</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.providerProfile.bio}
          onChange={handleBioChange}
          className="form-input bio-textarea"
          placeholder="Share your background, approach to therapy, and what makes your practice unique..."
          maxLength={maxBioLength}
          rows={8}
        />
        <small className="character-count">
          {currentLength}/{maxBioLength} characters
        </small>
      </div>

      <small className="step-hint">
        A thoughtful bio helps clients feel comfortable reaching out.
      </small>
    </div>
  );
};

export default OnboardingStep3;
