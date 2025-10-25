import React from "react";
import { useJournals } from "./context/JournalsContext";
import { useAuth } from "../auth/context/AuthContext";

const JournalList = () => {
  const {
    view,
    journals,
    searchAndFilters,
    pagination,
    isLoading,
    error,
    token,
    addJournal,
    showAllJournals,
    editJournal,
    removeJournal,
  } = useJournals();

  const { user, status, tokens, refresh } = useAuth();

  function viewMessage() {
    if (user.role === "provider") {
    }
  }

  return (
    <div>
      <h2>Journal List</h2>
      <div>
        <h3>My Journals</h3>
      </div>
    </div>
  );
};

export default JournalList;
