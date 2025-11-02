import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useEmailVerification } from "../../features/auth/context/EmailVerificationContext";
import ThemeSelector from "../theme/ThemeSelector";
import "../styles/Header.css";

const Header = () => {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { user, updateEmailVerificationStatus, logout } = useAuth();
  const { verifyCode, resendCode, initializeVerification } =
    useEmailVerification();

  const handleVerifyEmail = () => {
    if (user && user.email) {
      initializeVerification(user.email);
      setShowVerificationModal(true);
      setError(null);
      setSuccessMessage(null);
      setVerificationCode("");
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await verifyCode(verificationCode);

    if (result.success) {
      updateEmailVerificationStatus(true);
      setSuccessMessage("Email verified successfully!");
      setTimeout(() => {
        setShowVerificationModal(false);
        setSuccessMessage(null);
      }, 2000);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const result = await resendCode();

    if (result.success) {
      setSuccessMessage("New code sent to your email!");
      setVerificationCode("");
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const handleCloseModal = () => {
    setShowVerificationModal(false);
    setVerificationCode("");
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Journal</h1>

        {/* Navigation */}
        {user && (
          <nav className="header-nav">
            <Link to="/" className="nav-link">
              My Journals
            </Link>
            <Link to="/journals/new" className="nav-link create-link">
              + New Entry
            </Link>
            <Link to="/settings" className="nav-link">
              Settings
            </Link>
          </nav>
        )}

        <div className="header-user-info">
          {user && (
            <>
              <span className="username">{user.username || user.name}</span>
              <button onClick={logout}>logout</button>
              {!user.isEmailVerified && !user.isDemo && (
                <button
                  onClick={handleVerifyEmail}
                  className="verify-email-button"
                  title="Verify your email address"
                >
                  Email not verified - Click to verify
                </button>
              )}
            </>
          )}
        </div>
        <ThemeSelector />
      </div>

      {showVerificationModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Verify Your Email</h2>
            <p>Enter the verification code sent to {user?.email}</p>

            <form onSubmit={handleVerifySubmit}>
              <div className="form-field">
                <label htmlFor="verificationCode">Verification Code:</label>
                <input
                  name="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="form-input"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}

              <div className="modal-buttons">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="form-submit"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="resend-button"
                >
                  Resend Code
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
