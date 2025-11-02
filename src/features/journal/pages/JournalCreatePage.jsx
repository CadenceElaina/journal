import React from "react";
import { useNavigate } from "react-router-dom";
import JournalEntryForm from "../components/JournalEntryForm";

const JournalCreatePage = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="journal-create-page">
      <JournalEntryForm onCancel={handleCancel} />
    </div>
  );
};

export default JournalCreatePage;
