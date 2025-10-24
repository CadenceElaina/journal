import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { usePasswordReset } from "./context/PasswordResetContext";

const ResetAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");

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

  function handleChange(e) {
    const { name, value } = e.target;
    //  if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "password1") setPassword1(value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    if (showReset) {
      // reset password
    } else {
      // send email
      // user provides code?
      // code validated -> show reset password form
    }
    //api service reset

    //Notification of completion
    //Navigate to home and show user's journals
  }

  function handleDemoLogin() {}

  // User provides email
  if (currentStep === RESET_STEPS.email)
    return (
      <div className="reset-form-container">
        {" "}
        asdf
        <h2>{showReset ? "Forgot Password?" : "Reset Password"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <>
              {" "}
              <label htmlFor="username">Email:</label>
              <input
                name="username"
                label="username"
                value={email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </>
          </div>
          <Link to={"/"}>Back to Login</Link>
          <button onClick={handleDemoLogin} className="auth-form-button">
            Use Demo
          </button>

          <button type="submit" disabled={isLoading} className="form-submit">
            {isLoading && !showReset
              ? "Sending reset email..."
              : isLoading && showReset
              ? "Saving..."
              : "Send"}
          </button>
        </form>
      </div>
    );

  if (currentStep === RESET_STEPS.code)
    return (
      <div className="reset-form-container">
        <>
          {" "}
          <label htmlFor="password">New Password:</label>
          <input
            name="password"
            label="password"
            value={password}
            onChange={handleChange}
            className="form-input"
            required
          />
          <label htmlFor="password1">Confirm New Password:</label>
          <input
            name="password1"
            type="password"
            value={password1}
            onChange={handleChange}
            className="form-input"
            required
          />
        </>
        <h2>{showReset ? "Forgot Password?" : "Reset Password"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field"></div>
          <Link to={"/"}>Back to Login</Link>
          <button onClick={handleDemoLogin} className="auth-form-button">
            Use Demo
          </button>

          <button type="submit" disabled={isLoading} className="form-submit">
            {isLoading && !showReset
              ? "Sending reset email..."
              : isLoading && showReset
              ? "Saving..."
              : "Send"}
          </button>
        </form>
      </div>
    );
};

export default ResetAuth;
