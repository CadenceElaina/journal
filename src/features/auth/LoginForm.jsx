import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useForm } from "./hooks/useForm";

const LoginForm = () => {
  //notifications todo
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, loginAsDemo } = useAuth(); // Get the functions from context
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      //await login(formData)
      //success notification
      navigate("/");
    } catch (error) {
      setError(error.message || "Failed to login.");
      //fail notificaiton
    } finally {
      setIsLoading(false);
    }
  }

  function handleDemoLogin() {
    loginAsDemo();
    //logged in as - generate random funny name / username to show in header for demo user
    navigate("/");
  }

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit}>
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

        <button type="button" onClick={handleDemoLogin} className="demo-button">
          Continue as Demo User
        </button>

        <button type="submit" disabled={isLoading} className="form-submit">
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <Link to="/reset">Forgot password?</Link>
      </form>
    </div>
  );
};

export default LoginForm;
