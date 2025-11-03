import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJournals } from "../context/JournalsContext";
import "../styles/JournalViewPage.css";

const JournalViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { journals } = useJournals();
  const [journal, setJournal] = useState(null);

  useEffect(() => {
    const foundJournal = journals.find((j) => j.id === id);
    if (foundJournal) {
      setJournal(foundJournal);
    }
  }, [id, journals]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!journal) {
    return (
      <div className="journal-view-page">
        <div className="not-found">
          <h2>Journal not found</h2>
          <button onClick={() => navigate("/")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-view-page">
      <div className="view-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div className="view-actions">
          <button
            className="edit-button"
            onClick={() =>
              navigate(`/journals/${id}/edit`, { state: { from: "view" } })
            }
          >
            Edit
          </button>
        </div>
      </div>

      <article className="journal-view-content">
        <header className="journal-header">
          <h1>{journal.title}</h1>
          {journal.isShared && <span className="shared-badge">Shared</span>}
        </header>

        <div className="journal-meta">
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
          <div className="tags-section">
            <h3>Tags</h3>
            <div className="tags">
              {journal.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {journal.moods && journal.moods.length > 0 && (
          <div className="moods-section">
            <h3>Moods</h3>
            <div className="moods">
              {journal.moods.map((mood, index) => (
                <span key={index} className="mood">
                  {mood}
                </span>
              ))}
            </div>
          </div>
        )}

        {journal.custom_moods && journal.custom_moods.length > 0 && (
          <div className="custom-moods-section">
            <h3>Custom Moods</h3>
            <div className="custom-moods">
              {journal.custom_moods.map((mood, index) => (
                <span key={index} className="custom-mood">
                  {mood}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="journal-content">
          <div dangerouslySetInnerHTML={{ __html: journal.content }} />
        </div>
      </article>
    </div>
  );
};

export default JournalViewPage;
