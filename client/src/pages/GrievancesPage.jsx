import { useState } from "react";
import {
  FaPhone,
  FaVideo,
  FaComments,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";
import "./GrievancesPage.css";

const CONTACT_CARDS = [
  {
    id: "audio",
    title: "Audio Call",
    description: "Talk to our expert directly",
    icon: FaPhone,
    color: "#16a34a",
    action: "tel:+91987654321",
    actionLabel: "+91 987654321",
    type: "phone",
  },
  {
    id: "video",
    title: "Video Call",
    description: "Face-to-face consultation",
    icon: FaVideo,
    color: "#2563eb",
    action: "tel:+91987654321",
    actionLabel: "+91 987654321",
    type: "phone",
  },
  {
    id: "chat",
    title: "Chat Bot",
    description: "Chat with us on WhatsApp",
    icon: FaComments,
    color: "#25d366",
    action: "https://wa.me/91987654321?text=Hi%2C%20I%20need%20help%20with%20a%20property%20grievance",
    actionLabel: "Open WhatsApp",
    type: "whatsapp",
  },
];

function GrievancesPage() {
  const [activeCard, setActiveCard] = useState(null);

  const handleCardClick = (card) => {
    if (card.type === "whatsapp") {
      window.open(card.action, "_blank", "noopener,noreferrer");
    } else {
      setActiveCard(card);
    }
  };

  return (
    <div className="grievances">
      <section className="grievances__hero">
        <h1 className="grievances__hero-title">
          Property Problems? We&apos;ve Got Your Back!
        </h1>
        <p className="grievances__hero-subtitle">
          Free grievance support for every homebuyer, tenant, and property owner
        </p>
        <span className="grievances__free-badge">100% FREE Service</span>
      </section>

      <section className="section">
        <div className="container">
          <div className="grievances__info">
            <div className="grievances__info-block">
              <h2>What are Grievances?</h2>
              <p>
                Property grievances are complaints or problems faced by buyers,
                tenants, or owners — like delayed possession, builder fraud,
                illegal construction, unfair maintenance charges, or tenant
                disputes. These issues can feel overwhelming and isolating when
                you don&apos;t know where to turn.
              </p>
            </div>
            <div className="grievances__info-block">
              <h2>Why File a Grievance?</h2>
              <ul className="grievances__points">
                <li>Get expert guidance to resolve your property disputes</li>
                <li>Document your issue for legal or official reference</li>
                <li>Connect with professionals who understand real estate law</li>
                <li>It&apos;s completely free — we charge nothing for this service</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section grievances__before-after-section">
        <div className="container">
          <h2 className="section-title">Before vs After ChikuProp</h2>
          <div className="grievances__before-after">
            <div className="grievances__ba-card grievances__ba-card--before">
              <div className="grievances__ba-label">BEFORE</div>
              <img
                src="https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif"
                alt="Stressed homebuyer before"
                className="grievances__ba-img"
              />
              <p className="grievances__ba-text">
                Confused, stressed, running from office to office, no one listens...
              </p>
            </div>
            <div className="grievances__ba-arrow">→</div>
            <div className="grievances__ba-card grievances__ba-card--after">
              <div className="grievances__ba-label">AFTER</div>
              <img
                src="https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif"
                alt="Happy homeowner after resolution"
                className="grievances__ba-img"
              />
              <p className="grievances__ba-text">
                Issue resolved, expert guidance received, peace of mind restored!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Any Problem? We Are Here!</h2>
          <p className="grievances__cards-subtitle">
            Choose how you want to connect with our grievance experts
          </p>
          <div className="grievances__cards">
            {CONTACT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="grievance-card"
                  onClick={() => handleCardClick(card)}
                >
                  <div
                    className="grievance-card__icon-wrap"
                    style={{ background: card.color }}
                  >
                    <Icon className="grievance-card__icon" />
                  </div>
                  <h3 className="grievance-card__title">{card.title}</h3>
                  <p className="grievance-card__desc">{card.description}</p>
                  {card.type === "whatsapp" && (
                    <FaWhatsapp className="grievance-card__badge" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {activeCard && (
        <div className="grievance-popup__overlay" onClick={() => setActiveCard(null)}>
          <div
            className="grievance-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="grievance-popup__close"
              onClick={() => setActiveCard(null)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <div className="grievance-popup__body">
              <activeCard.icon
                className="grievance-popup__icon"
                style={{ color: activeCard.color }}
              />
              <h3>{activeCard.title}</h3>
              <p>Call us now for {activeCard.title.toLowerCase()} support</p>
              <a href={activeCard.action} className="grievance-popup__number">
                {activeCard.actionLabel}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrievancesPage;
