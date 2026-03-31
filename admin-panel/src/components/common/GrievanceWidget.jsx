import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./GrievanceWidget.css";

function GrievanceWidget() {
  const [showBubble, setShowBubble] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide widget on the grievances page itself
  if (location.pathname === "/grievances") return null;

  return (
    <div
      className="grievance-widget"
      onMouseEnter={() => setShowBubble(true)}
      onMouseLeave={() => setShowBubble(false)}
    >
      {showBubble && (
        <div className="grievance-widget__bubble" onClick={() => navigate("/grievances")}>
          <p className="grievance-widget__text">
            "Kya karu? Koi sunta hi nahi..."
          </p>
          <span className="grievance-widget__cta">Hum hai na! →</span>
        </div>
      )}
      <button
        className="grievance-widget__button"
        onClick={() => navigate("/grievances")}
        aria-label="Open grievances"
      >
        <span className="grievance-widget__emoji">😟</span>
      </button>
    </div>
  );
}

export default GrievanceWidget;
