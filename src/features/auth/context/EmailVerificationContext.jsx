import React, { createContext, useContext, useState } from "react";
import emailVerificationService from "../../../services/emailVerification";

const EmailVerificationContext = createContext(null);

const VERIFICATION_STEPS = {
  VERIFY: "verify",
  SUCCESS: "success",
};

export const EmailVerificationProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(VERIFICATION_STEPS.VERIFY);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializeVerification = (userEmail) => {
    setEmail(userEmail);
    setCurrentStep(VERIFICATION_STEPS.VERIFY);
    setError(null);
  };

  const verifyCode = async (code) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await emailVerificationService.verifyCode(email, code);
      setCurrentStep(VERIFICATION_STEPS.SUCCESS);
      return { success: true, data: result };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Invalid or expired code";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await emailVerificationService.sendVerificationCode(email);
      return { success: true };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to resend verification code";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCurrentStep(VERIFICATION_STEPS.VERIFY);
    setEmail("");
    setError(null);
  };

  const value = {
    currentStep,
    email,
    isLoading,
    error,
    VERIFICATION_STEPS,
    initializeVerification,
    verifyCode,
    resendCode,
    reset,
  };

  return (
    <EmailVerificationContext.Provider value={value}>
      {children}
    </EmailVerificationContext.Provider>
  );
};

export const useEmailVerification = () => {
  const context = useContext(EmailVerificationContext);
  if (!context) {
    throw new Error(
      "useEmailVerification must be used within an EmailVerificationProvider"
    );
  }
  return context;
};
