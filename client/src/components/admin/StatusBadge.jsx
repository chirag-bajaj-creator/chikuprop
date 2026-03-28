import "./StatusBadge.css";

const BADGE_MAP = {
  active: "admin-badge--green",
  paused: "admin-badge--yellow",
  expired: "admin-badge--gray",
  flagged: "admin-badge--orange",
  rejected: "admin-badge--red",
  approved: "admin-badge--green",
  pending: "admin-badge--yellow",
  "in-progress": "admin-badge--blue",
  resolved: "admin-badge--green",
  blocked: "admin-badge--red",
  user: "admin-badge--gray",
  admin: "admin-badge--blue",
};

function StatusBadge({ status }) {
  const className = BADGE_MAP[status] || "admin-badge--gray";
  const displayText = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")
    : "Unknown";

  return (
    <span className={`admin-badge ${className}`}>
      {displayText}
    </span>
  );
}

export default StatusBadge;
