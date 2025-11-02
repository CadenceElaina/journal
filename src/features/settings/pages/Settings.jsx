import React from "react";
import { useAuth } from "../../auth/context/AuthContext";
import "../styles/Settings.css";

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <h2>Profile Information</h2>
          <div className="setting-item">
            <label>Username:</label>
            <p>{user?.username}</p>
          </div>
          <div className="setting-item">
            <label>Email:</label>
            <p>{user?.email}</p>
          </div>
          <div className="setting-item">
            <label>Email Verified:</label>
            <p>{user?.isEmailVerified ? "✓ Yes" : "✗ No"}</p>
          </div>
        </section>

        <section className="settings-section">
          <h2>Account</h2>
          <p className="coming-soon">Profile editing coming soon...</p>
        </section>
      </div>
    </div>
  );
};

export default Settings;
