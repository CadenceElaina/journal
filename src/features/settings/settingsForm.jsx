import React, { useState } from "react";
import DeleteAccountModal from "./modals/DeleteAccountModal";

const settingsForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleAccountDelete() {
    console.log("delete");
    //TODO: Delete API call
    //TODO: notification
  }

  return (
    <div>
      <h2>Settings</h2>
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
