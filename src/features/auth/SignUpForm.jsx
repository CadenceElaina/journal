import React from "react";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useEmailVerification } from "./context/EmailVerificationContext";
import userService from "../../services/users";
import { useNavigate } from "react-router-dom";
import EmailVerificationForm from "./EmailVerificationForm";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVerification, setShowVerification] = useState(false);

  const { loginAsDemo, login } = useAuth();
  const { initializeVerification } = useEmailVerification();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log(formData);
    const result = await userService.signup(formData);

    if (result.success) {
      // Automatically log the user in after successful signup
      const loginResult = await login({
        username: formData.username,
        password: formData.password,
      });

      if (loginResult.success) {
        // Initialize email verification with the user's email
        initializeVerification(formData.email);
        setShowVerification(true);
      } else {
        setError("Account created but login failed. Please try logging in.");
      }
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }

  async function handleDemoLogin() {
    setIsLoading(true);
    const result = await loginAsDemo();
    //logged in as - generate random funny name / username to show in header for demo user
    setIsLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  }

  // Show verification form after successful signup
  if (showVerification) {
    return <EmailVerificationForm />;
  }

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit}>
        <div>
          <h3>Required: </h3>

          <div className="form-field">
            <label htmlFor="email">Email:</label>
            <input
              name="email"
              label="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="username">Username:</label>
            <input
              name="username"
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
              label="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>
        <div>
          <h3>Optional: </h3>
          <div className="form-field">
            <label htmlFor="name">Name:</label>
            <input
              name="name"
              label="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>
        <button type="button" onClick={handleDemoLogin} className="demo-button">
          Use Demo
        </button>

        <button type="submit" disabled={isLoading} className="form-submit">
          {isLoading ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;
