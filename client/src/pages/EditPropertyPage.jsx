import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPropertyById } from "../services/propertyService";
import PropertyForm from "../components/property/PropertyForm";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import "./EditPropertyPage.css";

function EditPropertyPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyById(id);

        if (!cancelled) {
          // Verify ownership
          if (data.vendorId !== user?._id && data.vendorId?.toString() !== user?._id?.toString()) {
            setError("You can only edit your own properties");
            setProperty(null);
          } else {
            setProperty(data);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = err.response?.data?.error || "Failed to load property";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (user) {
      fetchProperty();
    }

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="edit-property-page">
        <div className="edit-property-error">
          <ErrorState message={error} />
          <Link to="/my-listings" className="btn-secondary edit-back-link">
            Back to My Listings
          </Link>
        </div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="edit-property-page">
      <div className="edit-property-header">
        <div className="container edit-property-header-content">
          <div>
            <h1>Edit Property</h1>
            <p>{property.title}</p>
          </div>
          <Link to="/my-listings" className="btn-secondary edit-cancel-link">
            Cancel
          </Link>
        </div>
      </div>

      <div className="edit-property-content container">
        <PropertyForm
          mode="edit"
          initialData={property}
        />
      </div>
    </div>
  );
}

export default EditPropertyPage;
