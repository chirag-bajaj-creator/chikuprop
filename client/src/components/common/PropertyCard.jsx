import { Link, useLocation } from "react-router-dom";
import { FiMapPin, FiEye, FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { IoBedOutline } from "react-icons/io5";
import { LuBath } from "react-icons/lu";
import { BiArea } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/formatPrice";
import "./PropertyCard.css";

function PropertyCard({ property, viewMode = "grid", isSaved = false, onToggleSave }) {
  const { user, openAuthModal } = useAuth();
  const location = useLocation();

  const {
    _id,
    title,
    price,
    location: propLocation,
    listingType,
    propertyType,
    bedrooms,
    bathrooms,
    areaSqft,
    images,
    viewCount,
    planType,
  } = property;

  const priceLabel = listingType === "rent" ? "/month" : "";

  const handleHeartClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      openAuthModal("login", location.pathname);
      return;
    }

    if (onToggleSave) {
      onToggleSave(_id);
    }
  };

  return (
    <Link
      to={`/property/${_id}`}
      className={`property-card ${viewMode === "list" ? "property-card--list" : ""}`}
    >
      <div className="property-card__image">
        <img
          src={images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"}
          alt={title}
        />
        <span className="property-card__type">
          {listingType === "sale" ? "For Sale" : "For Rent"}
        </span>
        {planType === "paid" && (
          <span className="property-card__featured">Featured</span>
        )}
        {onToggleSave && (
          <button
            className={`property-card__heart ${isSaved ? "property-card__heart--saved" : ""}`}
            onClick={handleHeartClick}
            aria-label={isSaved ? "Remove from saved" : "Save property"}
            aria-pressed={isSaved}
          >
            {isSaved ? <FaHeart size={18} /> : <FiHeart size={18} />}
          </button>
        )}
      </div>

      <div className="property-card__details">
        <div className="property-card__price">
          &#8377;{formatPrice(price)}
          <span>{priceLabel}</span>
        </div>
        <h3 className="property-card__title">{title}</h3>
        <p className="property-card__location">
          <FiMapPin size={14} />
          {propLocation.area}, {propLocation.city}
        </p>

        <div className="property-card__features">
          {bedrooms > 0 && (
            <span>
              <IoBedOutline size={16} /> {bedrooms} Bed
            </span>
          )}
          {bathrooms > 0 && (
            <span>
              <LuBath size={16} /> {bathrooms} Bath
            </span>
          )}
          {areaSqft > 0 && (
            <span>
              <BiArea size={16} /> {areaSqft} sqft
            </span>
          )}
        </div>

        <div className="property-card__footer">
          <span className="property-card__tag">{propertyType}</span>
          <span className="property-card__views">
            <FiEye size={14} /> {viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;
