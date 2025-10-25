import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmailVerification } from "../context/EmailVerificationContext";
import { useAuth } from "../context/AuthContext";

const EmailVerificationForm = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();

  const {
    currentStep,
    email,
    isLoading,
    error,
    VERIFICATION_STEPS,
    verifyCode,
    resendCode,
  } = useEmailVerification();

  const { updateEmailVerificationStatus } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    const result = await verifyCode(verificationCode);

    if (result.success) {
      // Verification successful - update auth context
      updateEmailVerificationStatus(true);
    }
  };

  const handleResend = async () => {
    const result = await resendCode();
    if (result.success) {
      setVerificationCode("");
      // Show success notification
    }
  };

  const handleSkip = () => {
    // Allow user to proceed to dashboard without verification
    navigate("/");
  };

  if (currentStep === VERIFICATION_STEPS.SUCCESS) {
    return (
      <div className="verification-success">
        <h2>Email Verified!</h2>
        <p>Your email has been successfully verified.</p>
        <button onClick={() => navigate("/")}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <h2>Verify Your Email</h2>
      <p>
        We've sent a verification code to <strong>{email}</strong>
      </p>

      <form onSubmit={handleVerify}>
        <div className="form-field">
          <label htmlFor="verificationCode">Verification Code:</label>
          <input
            name="verificationCode"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="form-input"
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isLoading} className="form-submit">
          {isLoading ? "Verifying..." : "Verify Email"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isLoading}
          className="resend-button"
        >
          Resend Code
        </button>

        <button type="button" onClick={handleSkip} className="skip-button">
          Skip for Now
        </button>
      </form>
    </div>
  );
};

export default EmailVerificationForm;
