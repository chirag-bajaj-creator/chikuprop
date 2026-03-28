import { useState, useEffect } from "react";
import {
  FaPhone,
  FaVideo,
  FaComments,
  FaTimes,
  FaWhatsapp,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { createAppointment, getMyAppointments } from "../services/appointmentService";
import "./GrievancesPage.css";

const APPOINTMENT_TYPES = [
  { value: "audio_call", label: "Audio Call", icon: FaPhone, color: "#16a34a" },
  { value: "video_call", label: "Video Call", icon: FaVideo, color: "#2563eb" },
  { value: "chat", label: "Chat Bot", icon: FaComments, color: "#25d366" },
];

const CONTACT_CARDS = [
  {
    id: "audio",
    title: "Audio Call",
    icon: FaPhone,
    color: "#16a34a",
    action: "tel:+91987654321",
    actionLabel: "+91 987654321",
    type: "phone",
  },
  {
    id: "video",
    title: "Video Call",
    icon: FaVideo,
    color: "#2563eb",
    action: "tel:+91987654321",
    actionLabel: "+91 987654321",
    type: "phone",
  },
  {
    id: "chat",
    title: "Chat Bot",
    icon: FaComments,
    color: "#25d366",
    action: "https://wa.me/91987654321?text=Hi%2C%20I%20need%20help%20with%20a%20property%20grievance",
    actionLabel: "Open WhatsApp",
    type: "whatsapp",
  },
];

function GrievancesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeCard, setActiveCard] = useState(null);

  // Appointment form state
  const [description, setDescription] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // User's appointments
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // Fetch user's appointments on mount
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchAppts = async () => {
      try {
        setLoadingAppts(true);
        const res = await getMyAppointments();
        if (!cancelled) setAppointments(res.data || []);
      } catch {
        // silent — not critical
      } finally {
        if (!cancelled) setLoadingAppts(false);
      }
    };

    fetchAppts();
    return () => { cancelled = true; };
  }, [user]);

  const approvedAppointment = appointments.find((a) => a.status === "approved");
  const hasApprovedAppointment = !!approvedAppointment;
  const hasPendingAppointment = appointments.some((a) => a.status === "pending");

  // Map appointment type to contact card id
  const APPT_TYPE_TO_CARD = { audio_call: "audio", video_call: "video", chat: "chat" };
  const approvedCardId = approvedAppointment ? APPT_TYPE_TO_CARD[approvedAppointment.appointmentType] : null;

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();

    if (!description.trim() || description.trim().length < 20) {
      showToast("Description must be at least 20 characters", "error");
      return;
    }
    if (!appointmentType) {
      showToast("Please select an appointment type", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createAppointment({ description: description.trim(), appointmentType });
      setAppointments((prev) => [res.data, ...prev]);
      setDescription("");
      setAppointmentType("");
      showToast("Appointment request submitted! Waiting for admin approval.", "success");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit appointment";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardClick = (card) => {
    if (!hasApprovedAppointment) return;
    if (card.type === "whatsapp") {
      window.open(card.action, "_blank", "noopener,noreferrer");
    } else {
      setActiveCard(card);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "approved") return <FaCheckCircle className="appt-status-icon appt-status-icon--approved" />;
    if (status === "rejected") return <FaTimesCircle className="appt-status-icon appt-status-icon--rejected" />;
    return <FaClock className="appt-status-icon appt-status-icon--pending" />;
  };

  const formatType = (type) => type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

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

      {/* Appointment Request Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Book an Appointment</h2>
          <p className="grievances__cards-subtitle">
            Describe your issue and choose how you&apos;d like to connect. Admin will review and approve your request.
          </p>

          {!user ? (
            <div className="appt-login-prompt">
              <p>Please log in to book an appointment with our grievance experts.</p>
            </div>
          ) : hasPendingAppointment ? (
            <div className="appt-pending-notice">
              <FaClock className="appt-pending-notice__icon" />
              <div>
                <h3>Appointment Pending</h3>
                <p>Your appointment request is being reviewed by our team. We&apos;ll notify you once it&apos;s approved.</p>
              </div>
            </div>
          ) : !hasApprovedAppointment ? (
            <form className="appt-form" onSubmit={handleSubmitAppointment}>
              <div className="appt-form__group">
                <label className="appt-form__label" htmlFor="appt-desc">
                  Describe Your Issue
                </label>
                <textarea
                  id="appt-desc"
                  className="appt-form__textarea"
                  placeholder="Explain your property grievance in detail (min 20 characters)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  maxLength={2000}
                />
                <small className="appt-form__count">{description.length}/2000</small>
              </div>

              <div className="appt-form__group">
                <label className="appt-form__label" htmlFor="appt-type">
                  Appointment Type
                </label>
                <select
                  id="appt-type"
                  className="appt-form__select"
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                >
                  <option value="">Select appointment type...</option>
                  {APPOINTMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary appt-form__submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Request Appointment"}
              </button>
            </form>
          ) : null}
        </div>
      </section>

      {/* User's Appointments History */}
      {user && appointments.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Your Appointments</h2>
            <div className="appt-list">
              {loadingAppts ? (
                <p className="appt-list__loading">Loading...</p>
              ) : (
                appointments.map((appt) => (
                  <div key={appt._id} className="appt-card">
                    <div className="appt-card__header">
                      {getStatusIcon(appt.status)}
                      <span className={`appt-card__status appt-card__status--${appt.status}`}>
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </span>
                      <span className="appt-card__type">{formatType(appt.appointmentType)}</span>
                    </div>
                    <p className="appt-card__desc">{appt.description}</p>
                    {appt.adminNotes && (
                      <p className="appt-card__notes">
                        <strong>Admin:</strong> {appt.adminNotes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact Cards — only visible after approval */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Connect With Our Experts</h2>
          {!hasApprovedAppointment ? (
            <div className="appt-locked-notice">
              <p>Communication options will be available once your appointment is approved by our team.</p>
            </div>
          ) : (
            <>
              <p className="grievances__cards-subtitle">
                Your appointment is approved! Choose how you want to connect.
              </p>
              <div className="grievances__cards grievances__cards--single">
                {CONTACT_CARDS.filter((card) => card.id === approvedCardId).map((card) => {
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
                      <p className="grievance-card__desc">
                        {card.type === "whatsapp" ? "Chat with us on WhatsApp" : "Talk to our expert directly"}
                      </p>
                      {card.type === "whatsapp" && (
                        <FaWhatsapp className="grievance-card__badge" />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
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
