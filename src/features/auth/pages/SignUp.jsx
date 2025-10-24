import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEmailVerification } from "../context/EmailVerificationContext";
import userService from "../../../services/users";

import EmailVerificationForm from "../components/EmailVerificationForm";

const SignUp = () => {
  const [formData, setFormData] = useState({
    prefix: "",
    firstName: "",
    lastName: "",
    suffix: "",
    username: "",
    email: "",
    password: "",
    role: "nonProvider",
    providerProfile: {
      specialty: [],
      license: [],
      bio: null,
    },
  });
  const [isProvider, setIsProvider] = useState(false);
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

  function handleRoleChange(e) {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, role: value }));
    setIsProvider(value === "provider");
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
            <label htmlFor="provider">Are you a healthcare provider?:</label>
            <label htmlFor="yes">I'm a provider:</label>
            <input
              type="radio"
              name="role"
              label="yes"
              value="provider"
              onChange={handleRoleChange}
              checked={formData.role === "provider"} // if formData.role is not provider we do not check this radio
              className="form-input"
              required
            />
            <label htmlFor="yes">I'm not a provider:</label>
            <input
              type="radio"
              name="role"
              label="no"
              value="nonProvider"
              onChange={handleRoleChange}
              checked={formData.role === "nonProvider"}
              className="form-input"
              required
            />
          </div>
          {formData.role === "provider" && (
            <div className="form-field">
              <label htmlFor="specialty"></label>

              <label htmlFor="licenses"></label>
              <button onClick={add}>Add License</button>
            </div>
          )}
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
              type={showPassword ? "text" : "password"}
              name="password"
              label="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
            <label>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              Show Password
            </label>
          </div>
        </div>
        <div>
          <h3>Optional: </h3>
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

export default SignUp;
