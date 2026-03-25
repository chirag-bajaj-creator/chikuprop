import { createContext, useContext, useState, useCallback, useRef } from "react";
import Toast from "../components/common/Toast";

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const id = ++toastIdCounter;

    setToasts((prev) => {
      // Keep max 3 toasts — remove oldest if needed
      const updated = prev.length >= 3 ? prev.slice(1) : prev;
      return [...updated, { id, message, type }];
    });

    // Auto-dismiss after 4 seconds
    timersRef.current[id] = setTimeout(() => {
      removeToast(id);
    }, 4000);

    return id;
  }, [removeToast]);

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
