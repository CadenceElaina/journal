import React from "react";
import { useNavigate } from "react-router-dom";
import JournalList from "../components/JournalList";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
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

export default Dashboard;
