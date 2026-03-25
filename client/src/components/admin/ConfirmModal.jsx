import { useEffect, useRef } from "react";
import "./ConfirmModal.css";

function ConfirmModal({ isOpen, title, message, confirmLabel, confirmVariant, onConfirm, onCancel, loading }) {
  const cancelRef = useRef(null);

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKey);
    cancelRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={!loading ? onCancel : undefined}>
      <div
        className="admin-modal"
        role="alertdialog"
        aria-describedby="admin-modal-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="admin-modal__title">{title}</h3>
        <p className="admin-modal__message" id="admin-modal-message">{message}</p>
        <div className="admin-modal__actions">
          <button
            ref={cancelRef}
            className="admin-modal__btn admin-modal__btn--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`admin-modal__btn admin-modal__btn--${confirmVariant || "danger"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
