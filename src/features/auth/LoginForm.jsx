import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

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

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await login(formData); // Pass whole object {username, password}

    setIsLoading(false);

    if (result.success) {
      //success notification (optional)
      navigate("/");
    } else {
      setError(result.error);
      //fail notification (optional)
    }
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
          Use Demo
        </button>

        <button type="submit" disabled={isLoading} className="form-submit">
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <Link to="/reset">Forgot password?</Link>
        <Link to="/signup">Sign Up</Link>
      </form>
    </div>
  );
};

export default LoginForm;
