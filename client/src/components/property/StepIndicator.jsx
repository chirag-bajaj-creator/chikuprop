import "./StepIndicator.css";

const STEP_LABELS = [
  "Basic Details",
  "Location & Pricing",
  "Specifications",
  "Photos & Video",
  "Contact & Review",
];

function StepIndicator({ currentStep, completedSteps, onStepClick }) {
  const handleClick = (stepIndex) => {
    // Only allow clicking completed steps (to go back)
    if (completedSteps.includes(stepIndex)) {
      onStepClick(stepIndex);
    }
  };

  return (
    <div className="step-indicator" role="navigation" aria-label="Form progress">
      {STEP_LABELS.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = completedSteps.includes(index);
        const isCurrent = currentStep === index;
        const isClickable = isCompleted && !isCurrent;

        let stepClass = "step-item";
        if (isCurrent) stepClass += " step-current";
        if (isCompleted) stepClass += " step-completed";
        if (isClickable) stepClass += " step-clickable";

        return (
          <div
            key={index}
            className={stepClass}
            onClick={() => isClickable && handleClick(index)}
            role="button"
            tabIndex={isClickable ? 0 : -1}
            aria-current={isCurrent ? "step" : undefined}
            aria-label={`Step ${stepNum}: ${label}${isCompleted ? " (completed)" : ""}${isCurrent ? " (current)" : ""}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isClickable) handleClick(index);
            }}
          >
            <div className="step-circle">
              {isCompleted && !isCurrent ? (
                <span className="step-check">{"\u2713"}</span>
              ) : (
                <span className="step-number">{stepNum}</span>
              )}
            </div>
            <span className="step-label">{label}</span>
            {index < STEP_LABELS.length - 1 && (
              <div className={`step-line${isCompleted ? " step-line-completed" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StepIndicator;
