const SignUpForm = ({
  formData,
  handleChange,
  handleSubmit,
  handleRoleChange,
  handleDemoLogin,
  showPassword,
  setShowPassword,
  isLoading,
  error,
}) => {
  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit}>
        {/* Role Selection */}
        <div className="form-field">
          <label>I am signing up as:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="role"
                value="nonProvider"
                onChange={handleRoleChange}
                checked={formData.role === "nonProvider"}
                required
              />
              A Client/Patient
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="role"
                value="provider"
                onChange={handleRoleChange}
                checked={formData.role === "provider"}
                required
              />
              A Healthcare Provider
            </label>
          </div>
        </div>

        {/* First Name */}
        <div className="form-field">
          <label htmlFor="firstName">First Name:</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        {/* Last Name */}
        <div className="form-field">
          <label htmlFor="lastName">Last Name:</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        {/* Email */}
        <div className="form-field">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        {/* Username */}
        <div className="form-field">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            minLength="3"
            required
          />
        </div>

        {/* Password */}
        <div className="form-field">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((prev) => !prev)}
            />
            Show Password
          </label>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Demo Button */}
        <button type="button" onClick={handleDemoLogin} className="demo-button">
          Try Demo Instead
        </button>

        {/* Submit Button */}
        <button type="submit" disabled={isLoading} className="form-submit">
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;
