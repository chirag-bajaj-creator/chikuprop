import "./StatCard.css";

function StatCard({ icon, number, label }) {
  return (
    <div className="stat-card" aria-label={`${label}: ${number}`}>
      <div className="stat-card__icon">{icon}</div>
      <span className="stat-card__number">{number}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

export default StatCard;
