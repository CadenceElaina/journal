import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJournals } from "../context/JournalsContext";
import JournalCard from "./JournalCard";
import "../styles/JournalList.css";

const JournalList = ({ showControls = true }) => {
  const navigate = useNavigate();
  const {
    journals,
    pagination,
    isLoading,
    error,
    updatePage,
    clearError,
    removeJournal,
  } = useJournals();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleView = (journalId) => {
    navigate(`/journals/${journalId}`);
  };

  const handleEdit = (journalId) => {
    // Navigate to edit page from list (not from view)
    navigate(`/journals/${journalId}/edit`, { state: { from: "list" } });
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

  return (
    <div className="journals-list-container">
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}

      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading journals...</p>
        </div>
      ) : journals.length === 0 ? (
        <div className="empty-state">
          <h3>No journals yet</h3>
          <p>Start writing your first journal entry!</p>
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
            <div className="delete-confirm-overlay">
              <div className="delete-confirm-modal">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this journal entry?</p>
                <div className="delete-confirm-actions">
                  <button className="confirm-delete" onClick={confirmDelete}>
                    Yes, Delete
                  </button>
                  <button className="cancel-delete" onClick={cancelDelete}>
                    Cancel
                  </button>
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
