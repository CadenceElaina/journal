import React, { createContext, useContext, useState } from "react";
import authService from "../../../services/auth";

const PasswordResetContext = createContext(null);

/*  1. enter email -> send code
    2. enter code -> validate code
    3. enter new password -> update users password
*/

const RESET_STEPS = {
  EMAIL: "email",
  CODE: "code",
  PASSWORD: "password",
  SUCCESS: "success",
};

export const PasswordResetProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(RESET_STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [isLoading, setIsLoading] = useState("");
  const [error, setError] = useState(null);

  const requestReset = async (emailAddress) => {
    setIsLoading(true);
    setError(false);

    try {
      await authService.requestPasswordReset(emailAddress);
      setEmail(emailAddress);
      setCurrentStep(RESET_STEPS.CODE);
      return { success: true };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to send reset code";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (code) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyResetCode(email, code); // Pass both email AND code
      setResetCode(code); // Save code to use in resetPassword later
      setCurrentStep(RESET_STEPS.PASSWORD);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Invalid or expired code";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (newPassword) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(email, resetCode, newPassword);
      setCurrentStep(RESET_STEPS.SUCCESS);
      return { success: true };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to reset password";
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCurrentStep(RESET_STEPS.EMAIL);
    setEmail("");
    setResetCode("");
    setError("");
  };

  const value = {
    currentStep,
    email,
    isLoading,
    error,
    RESET_STEPS,
    requestReset,
    verifyCode,
    resetPassword,
    reset,
  };

  return (
    <PasswordResetContext.Provider value={value}>
      {children}
    </PasswordResetContext.Provider>
  );
};

export const usePasswordReset = () => {
  const context = useContext(PasswordResetContext);
  if (!context) {
    throw new Error(
      "usePasswordReset must be used within a PasswordResetProvider"
    );
  }
  return context;
};
