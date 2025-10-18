import React from "react";
import { useState } from "react";

const JournalEntryForm = () => {
  //notifications todo
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    isShared: false,
    title: "",
    content: "",
    tags: [],
    moods: [],
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    // post api journal service

    // catch err

    setIsLoading(false);
  }
  return (
    <div>
      <h2>JournalEntryForm</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="title">Title:</label>
          <input
            name="title"
            label="title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="content">What's up</label>
          <input
            name="content"
            label="content"
            value={formData.content}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div>chips / mood wheel?</div>
        <div>word count: </div>
        <div>Spell check?</div>

        <button type="submit" disabled={isLoading} className="form-submit">
          {isLoading ? "Saving entry..." : "Save"}
        </button>
      </form>
    </div>
  );
};

export default JournalEntryForm;
