import "./Toast.css";

function Toast({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          <span className="toast-icon">
            {toast.type === "success" && "\u2713"}
            {toast.type === "error" && "\u2717"}
            {toast.type === "info" && "\u2139"}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => onClose(toast.id)}
            aria-label="Close notification"
          >
            {"\u2715"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
