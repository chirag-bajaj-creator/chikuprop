import { useAuth } from "../../context/AuthContext";
import "./InactivityWarning.css";

function InactivityWarning() {
  const { showInactivityWarning, setShowInactivityWarning, resetInactivityTimer } = useAuth();

  if (!showInactivityWarning) return null;

  const handleStayLoggedIn = () => {
    setShowInactivityWarning(false);
    resetInactivityTimer();
  };

  return (
    <div className="inactivity-warning__overlay">
      <div className="inactivity-warning__modal">
        <div className="inactivity-warning__header">
          <h2>Session Expiring</h2>
        </div>
        <div className="inactivity-warning__content">
          <p>
            You've been inactive for <strong>25 minutes</strong>. Your session will expire in <strong>5 minutes</strong> for security reasons.
          </p>
          <p className="inactivity-warning__hint">
            Click "Stay Logged In" to continue or you will be automatically logged out.
          </p>
        </div>
        <div className="inactivity-warning__actions">
          <button
            className="inactivity-warning__btn inactivity-warning__btn--primary"
            onClick={handleStayLoggedIn}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}

export default InactivityWarning;
