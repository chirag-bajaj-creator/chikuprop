import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import "./WantedCard.css";

function WantedCard({ wanted }) {
  const formatPrice = (num) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)} L`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString("en-IN");
  };

  const typeLabels = {
    flat: "Flat",
    house: "House",
    plot: "Plot",
    commercial: "Commercial",
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="wanted-card">
      <div className="wanted-card__top">
        <span className={`wanted-card__badge wanted-card__badge--${wanted.listingType}`}>
          {wanted.listingType === "sale" ? "Want to Buy" : "Want to Rent"}
        </span>
        <span className="wanted-card__type">{typeLabels[wanted.propertyType]}</span>
      </div>

      <h3 className="wanted-card__title">{wanted.title}</h3>
      <p className="wanted-card__desc">{wanted.description}</p>

      <div className="wanted-card__budget">
        {wanted.listingType === "rent" ? "Budget: " : "Budget: "}
        <strong>
          {formatPrice(wanted.budget.min)} – {formatPrice(wanted.budget.max)}
        </strong>
        {wanted.listingType === "rent" && <span className="wanted-card__permonth">/month</span>}
      </div>

      <div className="wanted-card__meta">
        <span className="wanted-card__location">
          <FiMapPin size={14} />
          {wanted.location.area ? `${wanted.location.area}, ` : ""}
          {wanted.location.city}
        </span>
        {wanted.bedrooms !== undefined && wanted.bedrooms !== null && (
          <span className="wanted-card__beds">{wanted.bedrooms} BHK</span>
        )}
      </div>

      <div className="wanted-card__contact">
        <span className="wanted-card__contact-item">
          <FiPhone size={13} /> {wanted.contactPhone}
        </span>
        <span className="wanted-card__contact-item">
          <FiMail size={13} /> {wanted.contactEmail}
        </span>
      </div>

      <div className="wanted-card__footer">
        {wanted.userId?.name && (
          <span className="wanted-card__poster">by {wanted.userId.name}</span>
        )}
        <span className="wanted-card__time">{timeAgo(wanted.createdAt)}</span>
      </div>
    </div>
  );
}

export default WantedCard;
