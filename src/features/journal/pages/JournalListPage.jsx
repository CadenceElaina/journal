import React from "react";
import { useNavigate } from "react-router-dom";
import { useJournals } from "../context/JournalsContext";
import JournalList from "../components/JournalList";
import "../styles/Dashboard.css";

const JournalListPage = () => {
  const navigate = useNavigate();
  const {
    view,
    VIEWS,
    searchAndFilters,
    switchView,
    updateSearchTerm,
    updateSort,
    resetFilters,
  } = useJournals();

  const handleSearchChange = (e) => {
    updateSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    updateSort(e.target.value);
  };

  return (
    <div className="journal-list-page">
      <div className="dashboard-header">
        <div className="header-top">
          <h1>My Journals</h1>
          <button
            className="create-button"
            onClick={() => navigate("/journals/new")}
          >
            + New Journal Entry
          </button>
        </div>

        <div className="header-controls">
          <div className="view-switcher">
            <button
              onClick={() => switchView(VIEWS.MY_JOURNALS)}
              className={view === VIEWS.MY_JOURNALS ? "active" : ""}
            >
              My Journals
            </button>
            <button
              onClick={() => switchView(VIEWS.SHARED_JOURNALS)}
              className={view === VIEWS.SHARED_JOURNALS ? "active" : ""}
            >
              Shared Journals
            </button>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search journals..."
              value={searchAndFilters.term}
              onChange={handleSearchChange}
            />
          </div>

          <div className="sort-container">
            <select value={searchAndFilters.sort} onChange={handleSortChange}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="alpha">Alphabetical</option>
              <option value="edited">Recently Edited</option>
              <option value="wordcount_desc">Word Count (High to Low)</option>
              <option value="wordcount_asc">Word Count (Low to High)</option>
            </select>
          </div>

          <button className="reset-filters-button" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      <JournalList showControls={false} />
    </div>
  );
};

export default JournalListPage;
