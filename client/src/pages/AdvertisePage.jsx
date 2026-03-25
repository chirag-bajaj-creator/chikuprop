import { useState, useEffect } from "react";
import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaWhatsapp,
  FaTimes,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { TbSeo } from "react-icons/tb";
import "./AdvertisePage.css";

const AD_PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram Ads",
    icon: FaInstagram,
    color: "#E1306C",
    model: "Pay Per Click / Impression",
    services: [
      { name: "Reels Ads", price: "₹10 – ₹50 / click" },
      { name: "Story Ads", price: "₹10 – ₹50 / click" },
      { name: "Carousel Ads", price: "₹10 – ₹40 / click" },
      { name: "Photo / Image Ads", price: "₹5 – ₹30 / click" },
      { name: "Explore Ads", price: "₹7 – ₹50 / click" },
    ],
  },
  {
    id: "facebook",
    name: "Facebook Ads",
    icon: FaFacebook,
    color: "#1877F2",
    model: "Pay Per Click / Lead",
    services: [
      { name: "Text / Image Ads", price: "₹0.50 – ₹8 / click" },
      { name: "Video Ads", price: "₹2 – ₹10 / click" },
      { name: "Carousel Ads", price: "₹2 – ₹10 / click" },
      { name: "Lead Generation Ads", price: "₹100 – ₹400 / lead" },
    ],
  },
  {
    id: "youtube",
    name: "YouTube Ads",
    icon: FaYoutube,
    color: "#FF0000",
    model: "Pay Per View / Impression",
    services: [
      { name: "Sponsored Video (TrueView)", price: "₹0.50 – ₹3 / view" },
      { name: "Pre-roll / Mid-roll Ads", price: "₹12 – ₹43 / view" },
      { name: "Display Ads", price: "₹10 – ₹35 / 1K impressions" },
      { name: "Bumper Ads (6 sec)", price: "₹8 – ₹21 / 1K impressions" },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Ads",
    icon: FaWhatsapp,
    color: "#25D366",
    model: "Pay Per Click / Message",
    services: [
      { name: "Click-to-WhatsApp (Meta)", price: "₹0.50 – ₹8 / click" },
      { name: "Business Catalog Ads", price: "₹0.50 – ₹8 / click" },
      { name: "Marketing Broadcasts", price: "₹0.80 – ₹1.09 / message" },
    ],
  },
  {
    id: "organic",
    name: "Organic Marketing",
    icon: HiOutlineSpeakerphone,
    color: "#9333EA",
    model: "Monthly Retainer",
    services: [
      { name: "Social Media Management", price: "₹15,000 – ₹30,000 / month" },
      { name: "Content Marketing", price: "₹20,000 – ₹60,000 / month" },
      { name: "Community Building", price: "₹15,000 – ₹40,000 / month" },
    ],
  },
  {
    id: "seo",
    name: "SEO Services",
    icon: TbSeo,
    color: "#F59E0B",
    model: "Monthly Retainer",
    services: [
      { name: "On-page SEO", price: "₹10,000 – ₹30,000 / month" },
      { name: "Off-page SEO", price: "₹15,000 – ₹50,000 / month" },
      { name: "Technical SEO", price: "₹15,000 – ₹40,000 / month" },
      { name: "Local SEO", price: "₹15,000 – ₹60,000 / month" },
    ],
  },
];

function AdvertisePage() {
  const [activePopup, setActivePopup] = useState(null);
  const [showContact, setShowContact] = useState(false);

  const openPopup = (platform) => {
    setActivePopup(platform);
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closePopup();
    };
    if (activePopup) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [activePopup]);

  return (
    <div className="advertise">
      <section className="advertise__hero">
        <h1 className="advertise__hero-title">
          Grow Your Real Estate Business 10x!
        </h1>
        <p className="advertise__hero-subtitle">
          Reach thousands of potential buyers with our advertising and marketing
          services
        </p>
      </section>

      <section className="section">
        <div className="container">
          <div className="advertise__info">
            <div className="advertise__info-block">
              <h2>Why Paid Ads?</h2>
              <ul className="advertise__points">
                <li>Targeted reach to active property buyers and renters</li>
                <li>Measurable ROI — track every rupee you spend</li>
                <li>Quick results — start getting leads within hours</li>
                <li>Scale your campaigns based on performance</li>
              </ul>
            </div>
            <div className="advertise__info-block">
              <h2>Why Organic Marketing?</h2>
              <ul className="advertise__points">
                <li>Long-term sustainable growth for your brand</li>
                <li>Builds trust and credibility with buyers</li>
                <li>Cost-effective — no per-click charges</li>
                <li>Higher quality leads through genuine engagement</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Advertising Services</h2>
          <div className="advertise__grid">
            {AD_PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              return (
                <div key={platform.id} className="ad-card">
                  <div className="ad-card__header">
                    <Icon
                      className="ad-card__icon"
                      style={{ color: platform.color }}
                    />
                    <h3 className="ad-card__name">{platform.name}</h3>
                  </div>

                  <p className="ad-card__count">
                    {platform.services.length} ad types available
                  </p>
                  <span className="ad-card__model">{platform.model}</span>

                  <div className="ad-card__footer">
                    <button
                      className="btn-primary ad-card__cta"
                      onClick={() => openPopup(platform)}
                    >
                      View Ad Types
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {activePopup && (
        <div className="ad-popup__overlay" onClick={closePopup}>
          <div
            className="ad-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ad-popup__close"
              onClick={closePopup}
              aria-label="Close popup"
            >
              <FaTimes />
            </button>

            <div className="ad-popup__header">
              <activePopup.icon
                className="ad-popup__icon"
                style={{ color: activePopup.color }}
              />
              <h2 className="ad-popup__title">{activePopup.name}</h2>
            </div>

            <div className="ad-popup__model-badge">
              {activePopup.model}
            </div>

            <div className="ad-popup__list">
              {activePopup.services.map((service) => (
                <div key={service.name} className="ad-popup__item">
                  <span className="ad-popup__service-name">{service.name}</span>
                  <span className="ad-popup__price">{service.price}</span>
                </div>
              ))}
            </div>

            <p className="ad-popup__note">
              All prices are starting prices. Contact us for custom packages.
            </p>
          </div>
        </div>
      )}

      <section className="advertise__bottom-cta">
        <div className="container advertise__bottom-cta-content">
          <h2>Not sure which plan fits you?</h2>
          <p>Talk to our marketing team for a custom package</p>
          <button
            className="btn-primary"
            onClick={() => setShowContact(true)}
          >
            Contact Us
          </button>
        </div>
      </section>

      {showContact && (
        <div className="ad-popup__overlay" onClick={() => setShowContact(false)}>
          <div
            className="ad-popup contact-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ad-popup__close"
              onClick={() => setShowContact(false)}
              aria-label="Close popup"
            >
              <FaTimes />
            </button>

            <div className="contact-popup__header">
              <h2>Get in Touch</h2>
              <p>Reach out to our marketing team</p>
            </div>

            <div className="contact-popup__body">
              <a href="tel:+91987654321" className="contact-popup__item">
                <FaPhone className="contact-popup__icon" />
                <div>
                  <span className="contact-popup__label">Phone</span>
                  <span className="contact-popup__value">+91 987654321</span>
                </div>
              </a>
              <a href="mailto:chikuprop@gmail.com" className="contact-popup__item">
                <FaEnvelope className="contact-popup__icon" />
                <div>
                  <span className="contact-popup__label">Email</span>
                  <span className="contact-popup__value">chikuprop@gmail.com</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvertisePage;
