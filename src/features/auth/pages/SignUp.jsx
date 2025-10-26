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
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleRoleChange(e) {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, role: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

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
