import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiMapPin, FiEye, FiArrowLeft } from "react-icons/fi";
import { IoBedOutline } from "react-icons/io5";
import { LuBath } from "react-icons/lu";
import { BiArea } from "react-icons/bi";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import ContactUnlock from "../components/property/ContactUnlock";
import { getPropertyById } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { recordView } from "../services/recentlyViewedService";
import { formatPrice } from "../utils/formatPrice";
import "./PropertyDetail.css";

function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPropertyById(id);
      setProperty(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
    return () => {};
  }, [id]);

  // Track recently viewed for logged-in users
  useEffect(() => {
    if (user && id) {
      recordView(id).catch(() => {});
    }
  }, [user, id]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={fetchProperty} />;
  if (!property) return <ErrorState message="Property not found" />;

  return (
    <div className="mag">
      {/* Section 1: Big headline — text first, no image */}
      <div className="mag-headline">
        <div className="container">
          <Link
            to={property.listingType === "rent" ? "/rent" : "/buy"}
            className="mag-headline__back"
          >
            <FiArrowLeft size={16} />
            All Properties
          </Link>

          <div className="mag-headline__top">
            <span className="mag-headline__tag">
              {property.listingType === "sale" ? "Sale" : "Rent"}
            </span>
            <span className="mag-headline__tag mag-headline__tag--type">
              {property.propertyType}
            </span>
            {property.planType === "paid" && (
              <span className="mag-headline__tag mag-headline__tag--featured">
                Featured
              </span>
            )}
          </div>

          <h1 className="mag-headline__title">{property.title}</h1>

          <p className="mag-headline__location">
            <FiMapPin size={16} />
            {property.location.area}, {property.location.city},{" "}
            {property.location.state}
            {property.location.pincode && ` — ${property.location.pincode}`}
          </p>

          <div className="mag-headline__price">
            &#8377;{formatPrice(property.price)}
            {property.listingType === "rent" && (
              <span>/mo</span>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Horizontal image strip */}
      <div className="mag-images">
        <div className="mag-images__main">
          <img
            src={
              property.images?.[selectedImg] ||
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
            }
            alt={property.title}
          />
        </div>
        {property.images?.length > 1 && (
          <div className="mag-images__strip">
            {property.images.map((img, i) => (
              <button
                key={i}
                className={`mag-images__thumb ${i === selectedImg ? "mag-images__thumb--active" : ""}`}
                onClick={() => setSelectedImg(i)}
              >
                <img src={img} alt={`Photo ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Specs pull-quote bar */}
      <div className="mag-specs">
        <div className="container">
          <div className="mag-specs__grid">
            {property.bedrooms > 0 && (
              <div className="mag-specs__item">
                <IoBedOutline size={20} />
                <div>
                  <strong>{property.bedrooms} BHK</strong>
                  <small>Bedrooms</small>
                </div>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="mag-specs__item">
                <LuBath size={20} />
                <div>
                  <strong>{property.bathrooms}</strong>
                  <small>Bathrooms</small>
                </div>
              </div>
            )}
            {property.areaSqft > 0 && (
              <div className="mag-specs__item">
                <BiArea size={20} />
                <div>
                  <strong>{property.areaSqft}</strong>
                  <small>Sq. Ft</small>
                </div>
              </div>
            )}
            <div className="mag-specs__item">
              <FiEye size={20} />
              <div>
                <strong>{property.viewCount}</strong>
                <small>Views</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Two-column article body */}
      <div className="container">
        <div className="mag-body">
          {/* Left: Content */}
          <div className="mag-body__content">
            <div className="mag-block">
              <h2 className="mag-block__title">About</h2>
              <p className="mag-block__text">{property.description}</p>
            </div>

            <div className="mag-block">
              <h2 className="mag-block__title">Details</h2>
              <table className="mag-table">
                <tbody>
                  <tr>
                    <td>Property Type</td>
                    <td>{property.propertyType}</td>
                  </tr>
                  <tr>
                    <td>Listing</td>
                    <td>{property.listingType === "sale" ? "For Sale" : "For Rent"}</td>
                  </tr>
                  {property.furnishing && (
                    <tr>
                      <td>Furnishing</td>
                      <td>{property.furnishing}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Plan</td>
                    <td>{property.planType}</td>
                  </tr>
                  {property.bedrooms > 0 && (
                    <tr>
                      <td>Bedrooms</td>
                      <td>{property.bedrooms} BHK</td>
                    </tr>
                  )}
                  {property.bathrooms > 0 && (
                    <tr>
                      <td>Bathrooms</td>
                      <td>{property.bathrooms}</td>
                    </tr>
                  )}
                  {property.areaSqft > 0 && (
                    <tr>
                      <td>Area</td>
                      <td>{property.areaSqft} sq.ft</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {property.amenities?.length > 0 && (
              <div className="mag-block">
                <h2 className="mag-block__title">Amenities</h2>
                <div className="mag-amenities">
                  {property.amenities.map((a) => (
                    <span key={a} className="mag-amenity">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky contact card */}
          <aside className="mag-body__aside">
            <ContactUnlock
              propertyId={id}
              maskedPhone={property.maskedPhone}
              maskedEmail={property.maskedEmail}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
