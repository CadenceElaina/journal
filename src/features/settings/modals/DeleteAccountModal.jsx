import React, { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";

const DeleteAccountModal = ({ isOpen, onClose, onConfirmDelete }) => {
  const { user } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const REQUIRED_TEXT = `${user.username}`;
  // The delete button is disabled until the user types the exact required text
  const isButtonDisabled = confirmText !== REQUIRED_TEXT;

  function handleDelete() {
    if (!isButtonDisabled) {
      onConfirmDelete();
      handleClose(); // Close modal after deletion
    }
  }

  function handleClose() {
    setConfirmText("");
    onClose();
  }

  // If modal is not open then render nothing
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Are you sure you want to delete your account?</h2>
        <p>
          This action will delete your account. This is{" "}
          <strong>permanent</strong> and cannot be undone.
        </p>

        <div className="modal-input-section">
          <label htmlFor="confirm-delete-input">
            To confirm, please type <strong>{REQUIRED_TEXT}</strong> in the box
            below.
          </label>
          <input
            id="confirm-delete-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-delete"
            onClick={handleDelete}
            disabled={isButtonDisabled}
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
