import React from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useEmailVerification } from "../../auth/context/EmailVerificationContext";
import { useAuth } from "../../auth/context/AuthContext";
import OnboardingStep1 from "../components/OnboardingStep1";
import OnboardingStep2 from "../components/OnboardingStep2";
import OnboardingStep3 from "../components/OnboardingStep3";
import ProgressIndicator from "../components/ProgressIndicator";
import EmailVerificationForm from "../../auth/components/EmailVerificationForm";
import "../styles/onboarding.css";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { initializeVerification } = useEmailVerification();
  const {
    currentStep,
    formData,
    setFormData,
    isLoading,
    error,
    ONBOARDING_STEPS,
    nextStep,
    previousStep,
    submitOnboarding,
  } = useOnboarding();

  const [showVerification, setShowVerification] = React.useState(false);

  // Redirect if not a provider
  React.useEffect(() => {
    if (!user || user.role !== "provider") {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBioChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      providerProfile: { ...prev.providerProfile, bio: value },
    }));
  };

  const handleNext = () => {
    console.log("Next button clicked, moving from step", currentStep);
    nextStep();
  };

  const handleBack = () => {
    console.log("Back button clicked, moving from step", currentStep);
    previousStep();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Form submitted, current step:", currentStep);

    // Only submit if we're on the final step
    if (currentStep !== ONBOARDING_STEPS.STEP_3) {
      console.log("Prevented premature submission, current step:", currentStep);
      return;
    }

    const result = await submitOnboarding();

    if (result.success) {
      // Onboarding complete, show email verification
      if (user?.email) {
        initializeVerification(user.email);
        setShowVerification(true);
      } else {
        // Fallback if no email
        navigate("/");
      }
    }
  };

  // Show verification form after onboarding completion
  if (showVerification) {
    return <EmailVerificationForm />;
  }

  const totalSteps = 3;

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h2>Welcome! Let's Set Up Your Profile</h2>
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <form onSubmit={handleSubmit}>
          {/* Step 1: Prefix/Suffix */}
          {currentStep === ONBOARDING_STEPS.STEP_1 && (
            <OnboardingStep1 formData={formData} handleChange={handleChange} />
          )}

          {/* Step 2: Specialty/License */}
          {currentStep === ONBOARDING_STEPS.STEP_2 && (
            <OnboardingStep2 formData={formData} setFormData={setFormData} />
          )}

          {/* Step 3: Bio */}
          {currentStep === ONBOARDING_STEPS.STEP_3 && (
            <OnboardingStep3
              formData={formData}
              handleBioChange={handleBioChange}
            />
          )}

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Navigation Buttons */}
          <div className="onboarding-buttons">
            {currentStep > ONBOARDING_STEPS.STEP_1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleBack();
                }}
                className="back-button"
                disabled={isLoading}
              >
                Back
              </button>
            )}

            {currentStep < ONBOARDING_STEPS.STEP_3 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
                className="next-button"
                disabled={isLoading}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Completing..." : "Complete Onboarding"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
