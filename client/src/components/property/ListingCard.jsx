import { Link } from "react-router-dom";
import "./ListingCard.css";

function ListingCard({ property, onToggleStatus, onDelete }) {
  const {
    _id,
    title,
    price,
    listingType,
    propertyType,
    location,
    images,
    status,
    viewCount,
    contactUnlockCount,
    createdAt,
  } = property;

  const formatIndianPrice = (num) => {
    if (!num) return "N/A";
    return Number(num).toLocaleString("en-IN");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const typeBadge = `${propertyType ? propertyType.charAt(0).toUpperCase() + propertyType.slice(1) : ""} for ${listingType === "sale" ? "Sale" : "Rent"}`;

  return (
    <div className="listing-card">
      <div className="listing-card-thumb">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={title} />
        ) : (
          <div className="listing-card-placeholder">
            <span>No Photo</span>
          </div>
        )}
        <span className={`listing-card-status listing-card-status-${status}`}>
          {status === "active" ? "Active" : "Paused"}
        </span>
      </div>

      <div className="listing-card-body">
        <h4 className="listing-card-title">{title}</h4>
        <p className="listing-card-price">INR {formatIndianPrice(price)}</p>
        <p className="listing-card-location">
          {location?.area}{location?.area && location?.city ? ", " : ""}{location?.city}
        </p>
        <span className="listing-card-badge">{typeBadge}</span>

        <div className="listing-card-stats">
          <span>Views: {viewCount || 0}</span>
          <span>Contacts: {contactUnlockCount || 0}</span>
        </div>

        <p className="listing-card-date">Listed on {formatDate(createdAt)}</p>

        <div className="listing-card-actions">
          <Link to={`/edit-property/${_id}`} className="btn-secondary listing-card-edit">
            Edit
          </Link>
          <button
            className="listing-card-toggle"
            onClick={() => onToggleStatus(_id, status)}
          >
            {status === "active" ? "Pause" : "Activate"}
          </button>
          <button
            className="listing-card-delete"
            onClick={() => onDelete(property)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ListingCard;
