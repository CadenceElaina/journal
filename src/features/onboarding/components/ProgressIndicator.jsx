import React from "react";

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="progress-indicator">
      <div className="progress-text">
        Step {currentStep} of {totalSteps}
      </div>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
