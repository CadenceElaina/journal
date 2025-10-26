import React, { createContext, useContext, useState } from "react";
import onboardingService from "../../../services/onboarding";
import { useAuth } from "../../auth/context/AuthContext";

const OnboardingContext = createContext(null);

const ONBOARDING_STEPS = {
  STEP_1: 1,
  STEP_2: 2,
  STEP_3: 3,
  COMPLETE: 4,
};

export const OnboardingProvider = ({ children }) => {
  const { tokens } = useAuth();
  const [currentStep, setCurrentStep] = useState(ONBOARDING_STEPS.STEP_1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    prefix: "",
    suffix: "",
    providerProfile: {
      specialty: [],
      license: [],
      bio: "",
    },
  });

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.STEP_3) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const previousStep = () => {
    if (currentStep > ONBOARDING_STEPS.STEP_1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const submitOnboarding = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Set the token before making the API call
      onboardingService.setToken(tokens.token);
      const result = await onboardingService.completeOnboarding(formData);
      setCurrentStep(ONBOARDING_STEPS.COMPLETE);
      return { success: true, data: result };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to complete onboarding";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCurrentStep(ONBOARDING_STEPS.STEP_1);
    setFormData({
      prefix: "",
      suffix: "",
      providerProfile: {
        specialty: [],
        license: [],
        bio: "",
      },
    });
    setError(null);
  };

  const value = {
    currentStep,
    formData,
    setFormData,
    isLoading,
    error,
    ONBOARDING_STEPS,
    nextStep,
    previousStep,
    submitOnboarding,
    reset,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
