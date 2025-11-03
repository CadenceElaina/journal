import React from "react";
import "../styles/JournalCard.css";

const JournalCard = ({ journal, onEdit, onDelete, onView }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="journal-card">
      <div className="journal-card-header">
        <h3>{journal.title}</h3>
        {journal.isShared && <span className="shared-badge">Shared</span>}
      </div>

      <div className="journal-card-content">
        <p>{truncateContent(journal.content)}</p>
      </div>

      <div className="journal-card-meta">
        <div className="meta-info">
          <span className="word-count">{journal.wordCount} words</span>
          <span className="created-date">
            Created: {formatDate(journal.createdAt)}
          </span>
          {journal.updatedAt !== journal.createdAt && (
            <span className="updated-date">
              Updated: {formatDate(journal.updatedAt)}
            </span>
          )}
        </div>

        {journal.tags && journal.tags.length > 0 && (
          <div className="tags">
            {journal.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {journal.moods && journal.moods.length > 0 && (
          <div className="moods">
            {journal.moods.map((mood, index) => (
              <span key={index} className="mood">
                {mood}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="journal-card-actions">
        <button onClick={() => onView(journal.id)}>View</button>
        <button onClick={() => onEdit(journal.id)}>Edit</button>
        <button onClick={() => onDelete(journal.id)}>Delete</button>
      </div>
    </div>
  );
};

export default JournalCard;
