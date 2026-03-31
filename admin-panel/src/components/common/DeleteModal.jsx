import { useEffect, useRef } from "react";
import "./DeleteModal.css";

function DeleteModal({ isOpen, propertyTitle, onConfirm, onCancel, loading }) {
  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);

  // Focus trap and escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Focus cancel button on open
    cancelBtnRef.current?.focus();

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <div
      className="delete-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="delete-modal" ref={modalRef}>
        <div className="delete-modal-icon">
          <span>!</span>
        </div>
        <h3 id="delete-modal-title">Delete Property?</h3>
        {propertyTitle && (
          <p className="delete-modal-property">{propertyTitle}</p>
        )}
        <p className="delete-modal-warning">
          This action cannot be undone. Your listing will be permanently removed.
        </p>
        <div className="delete-modal-actions">
          <button
            className="btn-secondary delete-modal-cancel"
            onClick={onCancel}
            disabled={loading}
            ref={cancelBtnRef}
          >
            Cancel
          </button>
          <button
            className="delete-modal-confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner"></span> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
