import React, { useState } from "react";
import { useJournals } from "../context/JournalsContext";
import JournalCard from "./JournalCard";
import "../styles/JournalList.css";

const JournalList = () => {
  const {
    view,
    VIEWS,
    journals,
    searchAndFilters,
    pagination,
    isLoading,
    error,
    updateSearchTerm,
    updateFilters,
    updateSort,
    updatePage,
    switchView,
    resetFilters,
    clearError,
    removeJournal,
  } = useJournals();

  const [selectedJournal, setSelectedJournal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleView = (journalId) => {
    const journal = journals.find((j) => j.id === journalId);
    setSelectedJournal(journal);
  };

  const handleEdit = (journalId) => {
    const journal = journals.find((j) => j.id === journalId);
    setSelectedJournal(journal);
  };

  const handleDelete = (journalId) => {
    setShowDeleteConfirm(journalId);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      const result = await removeJournal(showDeleteConfirm);
      if (result.success) {
        setShowDeleteConfirm(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handlePageChange = (newPage) => {
    updatePage(newPage);
  };

  const handleSortChange = (e) => {
    updateSort(e.target.value);
  };

  const handleSearchChange = (e) => {
    updatePage(e.target.value);
  };

  return (
    <div className="journals-list-container">
      <div className="journal-list-header">
        <h2>
          {view === VIEWS.MY_JOURNALS ? "My Journals" : "Shared Journals"}
        </h2>

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
      </div>

      <div className="journal-list-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search journals..."
            value={searchAndFilters.term}
            onChange={handleSearchChange}
          />
        </div>
        <div className="sort-controls">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={searchAndFilters.sort}
            onChange={handleSortChange}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alpha">Alphabetical</option>
            <option value="edited">Recently Edited</option>
            <option value="wordcount_desc">Word Count (High to Low)</option>
            <option value="wordcount_asc">Word Count (Low to High)</option>
          </select>
        </div>

        <button onClick={resetFilters}>Reset Filters</button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading journals...</div>
      ) : journals.length === 0 ? (
        <div className="no-journals">
          <p>No journals found.</p>
        </div>
      ) : (
        <>
          <div className="journals-grid">
            {journals.map((journal) => (
              <JournalCard
                key={journal.id}
                journal={journal}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>

              <span className="total-count">
                Total: {pagination.totalPages} journals
              </span>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="delete-confirm-modal">
              <div className="modal-content">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this journal entry?</p>
                <div className="modal-actions">
                  <button onClick={confirmDelete}>Yes</button>
                  <button onClick={cancelDelete}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {selectedJournal && (
            <div className="journal-detail-modal">
              <div className="modal-content">
                <button
                  className="close-button"
                  onClick={() => setSelectedJournal(null)}
                >
                  x
                </button>
                <h2>{selectedJournal.title}</h2>
                <div className="journal-meta">
                  <span>{selectedJournal.wordCount}</span>
                  <span>
                    Created:{" "}
                    {new Date(selectedJournal.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {selectedJournal.tags && selectedJournal.tags.length > 0 && (
                  <div className="tags">
                    {selectedJournal.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {selectedJournal.moods && selectedJournal.moods.length > 0 && (
                  <div className="moods">
                    {selectedJournal.moods.map((mood, index) => (
                      <span key={index} className="mood">
                        {mood}
                      </span>
                    ))}
                  </div>
                )}
                <div className="journal-content">
                  <p>{selectedJournal.content}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JournalList;
