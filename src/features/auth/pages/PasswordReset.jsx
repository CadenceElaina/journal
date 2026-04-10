import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { usePasswordReset } from "../context/PasswordResetContext";
import "../styles/Login.css";

const PasswordReset = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    email,
    isLoading,
    error,
    RESET_STEPS,
    requestReset,
    verifyCode,
    resetPassword,
  } = usePasswordReset();

  const [emailInput, setEmailInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: request reset code
  if (currentStep === RESET_STEPS.EMAIL) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLocalError(null);
      await requestReset(emailInput);
    };

    return (
      <div className="auth-page">
        <div className="reset-form-container">
          <h2>Forgot Password?</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                name="email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {(error || localError) && (
              <div className="error-message">{error || localError}</div>
            )}

            <button type="submit" disabled={isLoading} className="form-submit">
              {isLoading ? "Sending..." : "Send Reset Code"}
            </button>

            <Link to="/auth/login">Back to Login</Link>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: enter the code
  if (currentStep === RESET_STEPS.CODE) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLocalError(null);
      await verifyCode(codeInput);
    };

    return (
      <div className="auth-page">
        <div className="reset-form-container">
          <h2>Enter Reset Code</h2>
          <form onSubmit={handleSubmit}>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              A code was sent to <strong>{email}</strong>
            </p>

            <div className="form-field">
              <label htmlFor="code">Reset Code:</label>
              <input
                id="code"
                name="code"
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="form-input"
                autoComplete="one-time-code"
                required
              />
            </div>

            {(error || localError) && (
              <div className="error-message">{error || localError}</div>
            )}

            <button type="submit" disabled={isLoading} className="form-submit">
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <Link to="/auth/login">Back to Login</Link>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: set new password
  if (currentStep === RESET_STEPS.PASSWORD) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLocalError(null);
      if (password !== password1) {
        setLocalError("Passwords do not match");
        return;
      }
      await resetPassword(password);
    };

    return (
      <div className="auth-page">
        <div className="reset-form-container">
          <h2>Set New Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="password">New Password:</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password1">Confirm Password:</label>
              <input
                id="password1"
                name="password1"
                type={showPassword ? "text" : "password"}
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="checkbox-field">
              <input
                type="checkbox"
                id="show-pw"
                checked={showPassword}
                onChange={() => setShowPassword((p) => !p)}
              />
              <label htmlFor="show-pw">Show passwords</label>
            </div>

            {(error || localError) && (
              <div className="error-message">{error || localError}</div>
            )}

            <button type="submit" disabled={isLoading} className="form-submit">
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <Link to="/auth/login">Back to Login</Link>
          </form>
        </div>
      </div>
    );
  }

  // Step 4: success
  if (currentStep === RESET_STEPS.SUCCESS) {
    return (
      <div className="auth-page">
        <div className="reset-form-container">
          <h2>Password Reset</h2>
          <p className="success-message">
            Your password has been reset successfully.
          </p>
          <button
            className="form-submit"
            onClick={() => navigate("/auth/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PasswordReset;
