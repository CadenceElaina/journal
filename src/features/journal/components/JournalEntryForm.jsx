import React, { useState, useEffect } from "react";
import { useJournals } from "../context/JournalsContext";
import { findRelatedMoods, isOfficialMood } from "../utils/moodUtils";
import { MOOD_WHEEL, COMMON_TAGS } from "../constants";

/* Mood / custom_moods / tags identification system

moods: ["Sad", "Proud"] (Official wheel words)

custom_moods: ["bummed"] (User-created feelings)

tags: ["Work", "Coding"] (Contextual, non-feeling words)

Complete User Flow

  1.  Write: The user writes their journal entry.

  2.  Analyze for suggested Moods & Tags (Optional): The user clicks an "Analyze" button. The app uses AI/NLP to suggest moods, custom_moods, and tags based on the text. The user can add any of these suggestions.

  3.  Quick Add: show common Moods & Tags & users custom_moods

  4.  Custom Input: The user types a word like "hopeless" into the "add feeling" text field.

  5.  Smart Suggest: The app checks relatedWordMap-(synonyms & related words (example: pointless -> "depressed", "sad", "apathetic", "despair", "empty" etc.)) and finds ["Sad", "Helpless", "Powerless"]. It sees the user has not already applied "Helpless" or "Powerless".

  6.  User Choice: The app presents the user with clear choices:

        Related Moods: [Helpless] [Powerless]

        Add as Custom Mood: [Add "hopeless"]

    Finalize: The user selects "Helpless" and also decides to add "hopeless" as a custom mood. The final entry is now tagged with:

        moods: ["Helpless"]

        custom_moods: ["hopeless"]

        tags: [Any tags added from steps 2 or 3] *user can create custom tags as well but we dont user synonyms/related words for tags

  KEY CONSIDERATIONS:
  The feelings wheel for example has tiers like Happy: ["optimistic, trusting", "peaceful" etc.] and each sub feeling of the main feeling has sub feelings -> optimistic: ["inspired", "hopeful"] - should we auto apply happy and optimistic if someone is inspired? No because you can be inspired through grief, fear, boredom, etc. Example: I am saddened by my friend losing their job but I am inspired to help them.

*/
/*
  1. THREE-CATEGORY SYSTEM: MOODS, CUSTOM_MOODS, TAGS
  
    moods: Standardized, searchable, analyzable
    custom_moods: Preserves user's authentic emotional vocabulary
    tags: Context without conflating feelings with events

*/
// Add common variants
// example hope, hoping, hoped, -> happy, optimistic, hopeful
// could route similar words like pointless/indifferent/

// RELATED WORDS MAP

/*
    2. AI / NLP ANALYSIS FEATURE

    Show why something was suggested - highlight text
    bulk accept/reject suggestions
    dont auto apply anything
    could store where user accepted/rejected suggestions to improve accuracy (edge case if user wrongly accepts/rejects - average over tiem? )
    track usage of custom_moods - what moods were associated with it?

*/

/*
    3. SMART SUGGEST WITH USER AGENCY
*/

const JournalEntryForm = ({ editingJournal = null, onCancel = null }) => {
  const { addJournal, editJournal, isLoading, error } = useJournals();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [],
    moods: [],
    custom_moods: [],
  });

  //notifications todo
  const [tagInput, setTagInput] = useState("");
  const [moodInput, setMoodInput] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Mood wheel state
  const [showMoodWheel, setShowMoodWheel] = useState(false);
  const [selectedPrimaryMood, setSelectedPrimaryMood] = useState(null);
  const [selectedSecondaryMood, setSelectedSecondaryMood] = useState(null);

  // Smart suggestions state
  const [moodSuggestions, setMoodSuggestions] = useState([]);
  const [showCustomMoodOption, setShowCustomMoodOption] = useState(false);

  // Recent/user history
  const [recentTags, setRecentTags] = useState([]);
  const [recentCustomMoods, setRecentCustomMoods] = useState([]);

  // Populate form if editing
  useEffect(() => {
    if (editingJournal) {
      setFormData({
        title: editingJournal.title || "",
        content: editingJournal.content || "",
        tags: editingJournal.tags || [],
        moods: editingJournal.moods || [],
        custom_moods: editingJournal.custom_moods || [],
      });
    }
  }, [editingJournal]);

  // Calculate word count
  useEffect(() => {
    const words = formData.content
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [formData.content]);

  // Load recent tags and custom moods from localStorage
  useEffect(() => {
    const storedTags = localStorage.getItem("recentJournalTags");
    const storedCustomMoods = localStorage.getItem("recentCustomMoods");

    if (storedTags) {
      try {
        setRecentTags(JSON.parse(storedTags));
      } catch (e) {
        console.error("Failed to parse recent tags", e);
      }
    }

    if (storedCustomMoods) {
      try {
        setRecentCustomMoods(JSON.parse(storedCustomMoods));
      } catch (e) {
        console.error("Failed to parse recent custom moods", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  // ============================================
  // TAGS HANDLERS
  // ============================================

  const saveRecentTag = (tag) => {
    const updated = [tag, ...recentTags.filter((t) => t !== tag)].slice(0, 10);
    setRecentTags(updated);
    localStorage.setItem("recentJournalTags", JSON.stringify(updated));
  };

  const handleAddTag = (tagToAdd) => {
    const trimmedTag = (
      typeof tagToAdd === "string" ? tagToAdd : tagInput
    ).trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      saveRecentTag(trimmedTag);
      setTagInput("");
    }
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // ============================================
  // MOODS HANDLERS (with Smart Suggestions)
  // ============================================

  const saveRecentCustomMood = (mood) => {
    const updated = [
      mood,
      ...recentCustomMoods.filter((m) => m !== mood),
    ].slice(0, 10);
    setRecentCustomMoods(updated);
    localStorage.setItem("recentCustomMoods", JSON.stringify(updated));
  };

  const handleMoodInputChange = (e) => {
    const value = e.target.value;
    setMoodInput(value);

    // Smart suggest as user types
    if (value.trim().length > 0) {
      const result = findRelatedMoods(value.trim(), [
        ...formData.moods,
        ...formData.custom_moods,
      ]);

      setMoodSuggestions(result.suggestions);
      setShowCustomMoodOption(result.userCanAddCustom);
    } else {
      setMoodSuggestions([]);
      setShowCustomMoodOption(false);
    }
  };

  const handleAddOfficialMood = (mood) => {
    if (mood && !formData.moods.includes(mood)) {
      setFormData((prev) => ({
        ...prev,
        moods: [...prev.moods, mood],
      }));
      setMoodInput("");
      setMoodSuggestions([]);
      setShowCustomMoodOption(false);
    }
  };

  const handleAddCustomMood = (customMood) => {
    const mood = customMood || moodInput;
    const trimmedMood = mood.trim();

    if (trimmedMood && !formData.custom_moods.includes(trimmedMood)) {
      setFormData((prev) => ({
        ...prev,
        custom_moods: [...prev.custom_moods, trimmedMood],
      }));
      saveRecentCustomMood(trimmedMood);
      setMoodInput("");
      setMoodSuggestions([]);
      setShowCustomMoodOption(false);
    }
  };

  const handleMoodInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // If there's an exact match or a top suggestion, use it
      if (moodSuggestions.length > 0) {
        handleAddOfficialMood(moodSuggestions[0]);
      } else if (isOfficialMood(moodInput)) {
        handleAddOfficialMood(moodInput);
      } else {
        handleAddCustomMood(moodInput);
      }
    }
  };

  const handleRemoveMood = (moodToRemove) => {
    setFormData((prev) => ({
      ...prev,
      moods: prev.moods.filter((mood) => mood !== moodToRemove),
    }));
  };

  const handleRemoveCustomMood = (moodToRemove) => {
    setFormData((prev) => ({
      ...prev,
      custom_moods: prev.custom_moods.filter((mood) => mood !== moodToRemove),
    }));
  };

  // ============================================
  // MOOD WHEEL HANDLERS
  // ============================================

  const handlePrimaryMoodClick = (primaryMood) => {
    if (selectedPrimaryMood === primaryMood) {
      setSelectedPrimaryMood(null);
      setSelectedSecondaryMood(null);
    } else {
      setSelectedPrimaryMood(primaryMood);
      setSelectedSecondaryMood(null);
    }
  };

  const handleSecondaryMoodClick = (secondaryMood) => {
    if (selectedSecondaryMood === secondaryMood) {
      setSelectedSecondaryMood(null);
    } else {
      setSelectedSecondaryMood(secondaryMood);
    }
  };

  const handleTertiaryMoodClick = (mood) => {
    handleAddOfficialMood(mood);
  };

  // ============================================
  // FORM SUBMISSION
  // ============================================

  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormError("Title is required");
      return false;
    }
    if (!formData.content.trim()) {
      setFormError("Content is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    const journalData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      tags: formData.tags,
      moods: formData.moods,
      custom_moods: formData.custom_moods,
    };

    let result;
    if (editingJournal) {
      result = await editJournal(editingJournal.id, journalData);
    } else {
      result = await addJournal(journalData);
    }

    if (result.success) {
      setSuccessMessage(
        editingJournal
          ? "Journal updated successfully!"
          : "Journal created successfully!"
      );
      if (!editingJournal) {
        setFormData({
          title: "",
          content: "",
          tags: [],
          moods: [],
          custom_moods: [],
        });
      }
      if (onCancel) {
        setTimeout(() => {
          onCancel();
        }, 1500);
      }
    } else {
      setFormError(result.error || "Failed to save journal");
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      content: "",
      tags: [],
      moods: [],
      custom_moods: [],
    });
    setTagInput("");
    setMoodInput("");
    setFormError("");
    setSuccessMessage("");
    setShowMoodWheel(false);
    setSelectedPrimaryMood(null);
    setSelectedSecondaryMood(null);
    setMoodSuggestions([]);
    setShowCustomMoodOption(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="journal-entry-form-container">
      <h2>{editingJournal ? "Edit Journal Entry" : "New Journal Entry"}</h2>

      {formError && <div className="error-message">{formError}</div>}
      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="journal-entry-form">
        {/* TITLE */}
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter journal title"
            required
          />
        </div>

        {/* CONTENT */}
        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your journal entry..."
            rows="10"
            required
          />
          <span className="word-counter">{wordCount} words</span>
        </div>

        {/* ============================================ */}
        {/* TAGS SECTION */}
        {/* ============================================ */}
        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <div className="input-with-button">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a custom tag"
              onKeyPress={handleTagInputKeyPress}
            />
            <button type="button" onClick={() => handleAddTag(tagInput)}>
              Add Tag
            </button>
          </div>

          {/* Selected Tags (Chips) */}
          {formData.tags.length > 0 && (
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag-chip">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="remove-chip"
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Recent Tags */}
          {recentTags.length > 0 && (
            <div className="suggested-items">
              <small>Recent:</small>
              <div className="suggested-buttons">
                {recentTags.map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    className="suggested-button"
                    onClick={() => handleAddTag(tag)}
                    disabled={formData.tags.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Common Tags */}
          <div className="suggested-items">
            <small>Suggested:</small>
            <div className="suggested-buttons">
              {COMMON_TAGS.map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  className="suggested-button"
                  onClick={() => handleAddTag(tag)}
                  disabled={formData.tags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* MOODS SECTION */}
        {/* ============================================ */}
        <div className="form-group">
          <label htmlFor="moods">How are you feeling?</label>

          {/* Mood Input with Smart Suggestions */}
          <div className="input-with-button">
            <input
              type="text"
              id="moods"
              value={moodInput}
              onChange={handleMoodInputChange}
              placeholder="Type a feeling..."
              onKeyPress={handleMoodInputKeyPress}
            />
          </div>

          {/* Smart Suggestions */}
          {moodSuggestions.length > 0 && (
            <div className="mood-suggestions">
              <small>💡 Related moods from wheel:</small>
              <div className="suggested-buttons">
                {moodSuggestions.map((mood, index) => (
                  <button
                    key={index}
                    type="button"
                    className="suggested-button mood-suggestion"
                    onClick={() => handleAddOfficialMood(mood)}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Mood Option */}
          {showCustomMoodOption && moodInput.trim() && (
            <div className="custom-mood-option">
              <small>✏️ Or add as custom feeling:</small>
              <button
                type="button"
                className="add-custom-mood-button"
                onClick={() => handleAddCustomMood()}
              >
                + Add "{moodInput}"
              </button>
            </div>
          )}

          {/* Selected Official Moods (Chips) */}
          {formData.moods.length > 0 && (
            <div className="moods-list">
              <small>Official moods:</small>
              <div className="chips-container">
                {formData.moods.map((mood, index) => (
                  <span key={index} className="mood-chip official">
                    {mood}
                    <button
                      type="button"
                      onClick={() => handleRemoveMood(mood)}
                      className="remove-chip"
                      aria-label={`Remove ${mood}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Selected Custom Moods (Chips) */}
          {formData.custom_moods.length > 0 && (
            <div className="custom-moods-list">
              <small>Your custom feelings:</small>
              <div className="chips-container">
                {formData.custom_moods.map((mood, index) => (
                  <span key={index} className="mood-chip custom">
                    {mood}
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomMood(mood)}
                      className="remove-chip"
                      aria-label={`Remove ${mood}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Custom Moods */}
          {recentCustomMoods.length > 0 && (
            <div className="suggested-items">
              <small>🎨 Your recent custom feelings:</small>
              <div className="suggested-buttons">
                {recentCustomMoods.map((mood, index) => (
                  <button
                    key={index}
                    type="button"
                    className="suggested-button custom-mood"
                    onClick={() => handleAddCustomMood(mood)}
                    disabled={formData.custom_moods.includes(mood)}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Mood Wheel */}
          <button
            type="button"
            className="toggle-mood-wheel"
            onClick={() => setShowMoodWheel(!showMoodWheel)}
          >
            {showMoodWheel ? "Hide" : "Show"} Mood Wheel
          </button>

          {/* Mood Wheel Selection - 3 Tiers */}
          {showMoodWheel && (
            <div className="mood-wheel-container">
              {/* Tier 1: Primary Moods */}
              <div className="primary-moods">
                <small>Primary Emotions:</small>
                <div className="mood-buttons">
                  {Object.keys(MOOD_WHEEL).map((primaryMood) => (
                    <button
                      key={primaryMood}
                      type="button"
                      className={`primary-mood ${
                        selectedPrimaryMood === primaryMood ? "active" : ""
                      }`}
                      onClick={() => handlePrimaryMoodClick(primaryMood)}
                    >
                      {primaryMood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier 2: Secondary Moods */}
              {selectedPrimaryMood && (
                <div className="secondary-moods">
                  <small>Refine your feeling:</small>
                  <div className="mood-buttons">
                    {Object.keys(MOOD_WHEEL[selectedPrimaryMood]).map(
                      (secondaryMood) => (
                        <button
                          key={secondaryMood}
                          type="button"
                          className={`secondary-mood ${
                            selectedSecondaryMood === secondaryMood
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            handleSecondaryMoodClick(secondaryMood)
                          }
                        >
                          {secondaryMood}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Tier 3: Tertiary Moods */}
              {selectedSecondaryMood && (
                <div className="tertiary-moods">
                  <small>Specific feelings:</small>
                  <div className="mood-buttons">
                    {MOOD_WHEEL[selectedPrimaryMood][selectedSecondaryMood].map(
                      (tertiaryMood) => (
                        <button
                          key={tertiaryMood}
                          type="button"
                          className="tertiary-mood"
                          onClick={() => handleTertiaryMoodClick(tertiaryMood)}
                          disabled={formData.moods.includes(tertiaryMood)}
                        >
                          {tertiaryMood}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : editingJournal
              ? "Update Journal"
              : "Create Journal"}
          </button>
          <button type="button" onClick={handleReset} disabled={isLoading}>
            {editingJournal ? "Cancel" : "Reset"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalEntryForm;
