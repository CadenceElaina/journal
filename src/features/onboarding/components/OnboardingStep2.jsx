import React from "react";
import TagInput from "./TagInput";

const OnboardingStep2 = ({ formData, setFormData }) => {
  const setSpecialty = (specialty) => {
    setFormData((prev) => ({
      ...prev,
      providerProfile: { ...prev.providerProfile, specialty },
    }));
  };

  const setLicense = (license) => {
    setFormData((prev) => ({
      ...prev,
      providerProfile: { ...prev.providerProfile, license },
    }));
  };

  return (
    <div className="onboarding-step">
      <h3>Specialties & Licenses</h3>
      <p className="step-description">
        Tell clients about your areas of expertise and professional licenses.
      </p>

      <TagInput
        label="Specialties:"
        tags={formData.providerProfile.specialty}
        setTags={setSpecialty}
        placeholder="e.g., Anxiety, Depression, PTSD"
      />

      <TagInput
        label="Licenses:"
        tags={formData.providerProfile.license}
        setTags={setLicense}
        placeholder="e.g., Licensed Clinical Psychologist, State of CA"
      />

      <small className="step-hint">
        Add multiple entries by typing and pressing Enter after each one.
      </small>
    </div>
  );
};

export default OnboardingStep2;
