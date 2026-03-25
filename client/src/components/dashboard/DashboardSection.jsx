import { Link } from "react-router-dom";
import PropertyCard from "../common/PropertyCard";
import "./DashboardSection.css";

function DashboardSection({
  title,
  properties,
  emptyMessage,
  emptyAction,
  emptyActionLink,
  showViewAll,
  savedIds,
  onToggleSave,
}) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <h2>{title}</h2>
        {showViewAll && (
          <span className="dashboard-section__view-all">View All</span>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="dashboard-section__empty">
          <p>{emptyMessage}</p>
          {emptyAction && emptyActionLink && (
            <Link to={emptyActionLink} className="btn-primary">
              {emptyAction}
            </Link>
          )}
        </div>
      ) : (
        <div className="dashboard-section__grid">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              isSaved={savedIds ? savedIds.has(property._id) : false}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardSection;
