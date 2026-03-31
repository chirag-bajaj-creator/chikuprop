import "./ErrorState.css";

function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <h3>Something went wrong</h3>
      <p>{message || "An unexpected error occurred. Please try again."}</p>
      {onRetry && (
        <button className="btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
