import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useJournals } from "../context/JournalsContext";
import JournalEntryForm from "../components/JournalEntryForm";
import "../styles/Dashboard.css";

const JournalEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { journals } = useJournals();
  const [journal, setJournal] = useState(null);

  useEffect(() => {
    const foundJournal = journals.find((j) => j.id === id);
    if (foundJournal) {
      setJournal(foundJournal);
    }
  }, [id, journals]);

  const handleCancel = () => {
    // Check if we came from the view page
    const cameFromView = location.state?.from === "view";

    if (cameFromView) {
      // Go back to view page
      navigate(`/journals/${id}`);
    } else {
      // Go back to journal list
      navigate("/");
    }
  };

  if (!journal) {
    return (
      <div className="journal-edit-page">
        <div className="not-found">
          <h2>Journal not found</h2>
          <button onClick={() => navigate("/")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-edit-page">
      <JournalEntryForm editingJournal={journal} onCancel={handleCancel} />
    </div>
  );
};

export default JournalEditPage;
