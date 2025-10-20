import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";

const ResetAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
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

  // User provides email
  return (
    <div className="reset-form-container">
      {" "}
      asdf
      <h2>{showReset ? "Forgot Password?" : "Reset Password"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          {!showReset && (
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
          )}
          {showReset && (
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
          )}
        </div>
        <Link to={"/"} onClick={handleDemoLogin}>Demo Login</button>

        <button type="submit" disabled={isLoading} className="form-submit">
          {isLoading && !showReset
            ? "Sending reset email..."
            : isLoading && showReset
            ? "Saving..."
            : "Send"}
        </button>
        <Link to={"/"}>Login</Link>
      </form>
    </div>
  );
};

export default ResetAuth;
