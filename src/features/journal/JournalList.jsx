import React from "react";
import { useJournals } from "./context/JournalsContext";

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
