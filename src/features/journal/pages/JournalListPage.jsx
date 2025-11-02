import React from "react";
import { useNavigate } from "react-router-dom";
import JournalList from "../components/JournalList";
import "../styles/Dashboard.css";

const JournalListPage = () => {
  const navigate = useNavigate();

  return (
    <div className="journal-list-page">
      <div className="page-header">
        <h1>My Journals</h1>
        <button
          className="create-button"
          onClick={() => navigate("/journals/new")}
        >
          + New Journal Entry
        </button>
      </div>
      <JournalList />
    </div>
  );
};

export default JournalListPage;
