import React, { useState } from "react";

const TagInput = ({ label, tags, setTags, placeholder }) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Always prevent form submission on Enter
      e.stopPropagation(); // Prevent event from bubbling up
      if (inputValue.trim()) {
        if (!tags.includes(inputValue.trim())) {
          setTags([...tags, inputValue.trim()]);
        }
        setInputValue("");
      }
      return false; // Extra safeguard
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="tag-input-container">
      <label>{label}</label>
      <div className="tag-input-wrapper">
        <div className="tags-display">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="tag-remove"
                aria-label={`Remove ${tag}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="tag-input"
        />
      </div>
      <small className="tag-hint">
        Press Enter to add, Backspace to remove
      </small>
    </div>
  );
};

export default TagInput;
