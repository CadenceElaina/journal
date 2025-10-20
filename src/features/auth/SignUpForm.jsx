import React from "react";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";

const SignUpForm = () => {
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

        <Link to={"/"} onClick={au}>
          Demo Login
        </Link>

        <button type="submit" disabled={isLoading} className="form-submit">
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <Link to="/reset">Forgot password?</Link>
      </form>
    </div>
  );
};

export default SignUpForm;
