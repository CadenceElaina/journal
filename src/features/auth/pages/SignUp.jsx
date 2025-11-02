import zxcvbn from "zxcvbn";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEmailVerification } from "../context/EmailVerificationContext";
import userService from "../../../services/users";

import EmailVerificationForm from "../components/EmailVerificationForm";
import SignUpForm from "../components/SignUpForm";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "nonProvider",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const { loginAsDemo, login, isLoading, error, setError } = useAuth();
  const { initializeVerification } = useEmailVerification();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "password") {
      const validationErrors = validatePassword(value);
      setError(validationErrors);
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleRoleChange(e) {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, role: value }));
  }

  function validatePassword(password) {
    const validationErrors = [];

    if (password.length < 8) {
      validationErrors.push("Password must be at least 8 characters long");
    }

    if (password.length > 128) {
      validationErrors.push("Password must be less than 128 characters");
    }

    if (!/[a-z]/.test(password)) {
      validationErrors.push(
        "Password must contain at least one lowercase letter"
      );
    }

    if (!/[A-Z]/.test(password)) {
      validationErrors.push(
        "Password must contain at least one uppercase letter"
      );
    }

    if (!/[0-9]/.test(password)) {
      validationErrors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      validationErrors.push(
        "Password must contain at least one special character"
      );
    }

    /*  
This is too restrictive for our use but would likely be used for a web app that had many users and was focused on security & protecting user health data etc
if (password) {
      const result = zxcvbn(password);
      if (result.score < 3) {
        validationErrors.push(
          "Password is too weak. Avoid common words and patterns."
        );
      }
    } */

    return validationErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const validationErrors = validatePassword(formData.password);
    if (validationErrors.length > 0) {
      setError(validationErrors);
      return;
    }

    const result = await userService.signup(formData);

    if (result.success) {
      // Automatically log the user in after successful signup
      const loginResult = await login({
        username: formData.username,
        password: formData.password,
      });

      if (loginResult.success) {
        // If provider, redirect to onboarding
        if (formData.role === "provider") {
          navigate("/onboarding");
        } else {
          // NonProvider: show verification
          initializeVerification(formData.email);
          setShowVerification(true);
        }
      } else {
        setError("Account created but login failed. Please try logging in.");
      }
    } else {
      setError(result.error);
    }
  }

  async function handleDemoLogin() {
    const result = await loginAsDemo();

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
    <div className="auth-page">
      <h2>Create Your Account</h2>
      <SignUpForm
        formData={formData}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleChange={handleChange}
        handleRoleChange={handleRoleChange}
        handleSubmit={handleSubmit}
        handleDemoLogin={handleDemoLogin}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default SignUp;
