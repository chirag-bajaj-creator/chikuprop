import { Link } from "react-router-dom";
import { FiHome, FiSearch, FiFileText, FiShield, FiStar, FiTrendingUp } from "react-icons/fi";
import "./ServicesPage.css";

const services = [
  {
    icon: <FiHome size={28} />,
    title: "Property Listing",
    description: "List your property for free and reach thousands of buyers and renters across India.",
    link: "/add-property",
    cta: "List Property",
  },
  {
    icon: <FiSearch size={28} />,
    title: "Property Search",
    description: "Search from thousands of verified listings with powerful filters for city, budget, and type.",
    link: "/buy",
    cta: "Browse Properties",
  },
  {
    icon: <FiFileText size={28} />,
    title: "Find Your Vibe",
    description: "Post your requirement and let sellers and landlords find you with the right property.",
    link: "/wanted",
    cta: "Post Requirement",
  },
  {
    icon: <FiShield size={28} />,
    title: "Grievance Support",
    description: "Free expert support for property disputes, complaints, and issues. We are here to help.",
    link: "/grievances",
    cta: "File Grievance",
  },
  {
    icon: <FiStar size={28} />,
    title: "Property Advertising",
    description: "Boost your listing with premium placement and featured badges for maximum visibility.",
    link: "/advertise",
    cta: "Advertise Now",
  },
  {
    icon: <FiTrendingUp size={28} />,
    title: "Market Insights",
    description: "Get data-driven insights about property trends, pricing, and demand in your area.",
    link: null,
    cta: "Coming Soon",
  },
];

function ServicesPage() {
  return (
    <div className="services-page">
      <div className="services-hero">
        <div className="container services-hero-content">
          <h1>Our Services</h1>
          <p className="services-hero-subtitle">
            Everything you need for your property journey — from search to settlement
          </p>
        </div>
      </div>

      <div className="container services-content">
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.title} className="service-card">
              <div className="service-card__icon">{service.icon}</div>
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__desc">{service.description}</p>
              {service.link ? (
                <Link to={service.link} className="btn-secondary service-card__cta">
                  {service.cta}
                </Link>
              ) : (
                <span className="service-card__coming-soon">{service.cta}</span>
              )}
            </div>
          ))}
        </div>

        <div className="services-bottom-cta">
          <h2>Ready to get started?</h2>
          <p>Join thousands of buyers, sellers, and renters on ChikuProp.</p>
          <div className="services-bottom-actions">
            <Link to="/buy" className="btn-secondary">Browse Properties</Link>
            <Link to="/add-property" className="btn-primary">List Your Property</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServicesPage;
