import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";
import userService from "../../services/users";
import DeleteAccountModal from "./modals/DeleteAccountModal";

const settingsForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleAccountDelete(password) {
    try {
      await userService.deleteAccount(password);
      await logout();
      navigate("/auth/login");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete account");
    }
  }

  return (
    <div>
      <h2>Settings</h2>
      {error && <div className="error-message">{error}</div>}
      <button onClick={() => setIsModalOpen(true)}>Delete Account</button>
      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmDelete={handleAccountDelete}
      />
    </div>
  );
};

export default settingsForm;
