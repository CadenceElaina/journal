import React from "react";
import Login from "../../auth/pages/Login";
import { useAuth } from "../../auth/context/AuthContext";
import JournalEntryForm from "../components/JournalEntryForm";
import JournalList from "../components/JournalList";

const Dashboard = () => {
  const { status } = useAuth();

  return (
    <>
      <div>
        <JournalList />
        <JournalEntryForm />
      </div>
      <div>{status === "loggedOut" && <Login />}</div>
    </>
  );
};

export default Dashboard;
