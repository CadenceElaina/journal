import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const { login, verify2FA, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleCheckboxChange() {
    setShowPassword(!showPassword);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await login(formData);

    setIsLoading(false);

    if (result.success) {
      navigate("/");
    } else if (result.requires2FA) {
      setRequires2FA(true);
      setTempToken(result.tempToken);
    } else {
      setError(result.error);
    }
  }

  async function handle2FASubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await verify2FA(
      tempToken,
      useBackupCode ? null : twoFactorCode,
      useBackupCode ? twoFactorCode : null,
    );

    setIsLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  }

  async function handleDemoLogin() {
    setIsLoading(true);
    const result = await loginAsDemo();
    setIsLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  }

  if (requires2FA) {
    return (
      <div className="auth-page">
        <div className="login-form-container">
          <h2>Two-Factor Authentication</h2>
          <form onSubmit={handle2FASubmit}>
            <p>
              {useBackupCode
                ? "Enter a backup code to continue."
                : "Enter the 6-digit code from your authenticator app."}
            </p>

            <div className="form-field">
              <label htmlFor="twoFactorCode">
                {useBackupCode ? "Backup Code:" : "Authentication Code:"}
              </label>
              <input
                name="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="form-input"
                autoComplete="one-time-code"
                autoFocus
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={isLoading} className="form-submit">
              {isLoading ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              className="demo-button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setTwoFactorCode("");
                setError(null);
              }}
            >
              {useBackupCode
                ? "Use authenticator code instead"
                : "Use a backup code instead"}
            </button>

            <button
              type="button"
              className="demo-button"
              onClick={() => {
                setRequires2FA(false);
                setTempToken(null);
                setTwoFactorCode("");
                setError(null);
              }}
            >
              Back to login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="login-form-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="username">Username:</label>
            <input
              name="username"
              type="text"
              label="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password:</label>
            <input
              name="password"
              type={!showPassword ? "password" : "text"}
              label="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
            <div className="checkbox-field">
              <input
                name="show-password"
                type="checkbox"
                onChange={handleCheckboxChange}
              />
              <label htmlFor="show-password">Show password</label>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading} className="form-submit">
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="demo-button"
            disabled={isLoading}
          >
            {isLoading ? "Loading demo..." : "Try Demo"}
          </button>

          <Link to="/auth/reset-password">Forgot password?</Link>
          <Link to="/auth/signup">Sign Up</Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
