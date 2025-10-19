import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const LoginForm = () => {
  //notifications todo
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    //api service login

    //handle success/fail & notify & route
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

        <button>Demo Login</button>

        <button type="submit" disabled={isLoading} className="form-submit">
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <Link to="/reset">Forgot password?</Link>
      </form>
    </div>
  );
};

export default LoginForm;
