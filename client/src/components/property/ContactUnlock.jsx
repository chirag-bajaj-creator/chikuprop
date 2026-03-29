import { useState, useEffect } from "react";
import { FiPhone, FiMail, FiLock, FiUnlock, FiCalendar, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { unlockContact, checkUnlockStatus } from "../../services/leadService";
import "./ContactUnlock.css";

function ContactUnlock({ propertyId, maskedPhone, maskedEmail }) {
  const { user, openAuthModal } = useAuth();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  // Check if already unlocked when user is logged in
  useEffect(() => {
    let cancelled = false;

    const checkStatus = async () => {
      if (!user || !propertyId) return;
      try {
        setChecking(true);
        const res = await checkUnlockStatus(propertyId);
        if (!cancelled && res.data.data.unlocked) {
          setContact({
            phone: res.data.data.contactPhone,
            email: res.data.data.contactEmail,
          });
        }
      } catch {
        // Silently fail — user just hasn't unlocked yet
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, [user, propertyId]);

  const handleUnlock = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await unlockContact(propertyId);
      setContact({
        phone: res.data.data.contactPhone,
        email: res.data.data.contactEmail,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to unlock contact");
    } finally {
      setLoading(false);
    }
  };

  // State 3: Contact unlocked — show full details + action buttons + appointment
  if (contact) {
    return (
      <div className="mag-contact mag-contact--unlocked">
        {/* Header */}
        <div className="mag-contact__header">
          <div className="mag-contact__header-top">
            <FiUnlock size={16} className="mag-contact__icon--success" />
            <span>Contact Unlocked</span>
          </div>
          <h3>Get in Touch</h3>
        </div>

        {/* Contact Fields */}
        <div className="mag-contact__contact-block">
          <a href={`tel:${contact.phone}`} className="mag-contact__field mag-contact__field--active">
            <FiPhone size={16} />
            <span>{contact.phone}</span>
          </a>

          <a href={`mailto:${contact.email}`} className="mag-contact__field mag-contact__field--active">
            <FiMail size={16} />
            <span>{contact.email}</span>
          </a>
        </div>

        {/* Direct Actions */}
        <div className="mag-contact__actions">
          <a
            href={`tel:${contact.phone}`}
            className="mag-contact__btn mag-contact__btn--call"
          >
            <FiPhone size={14} />
            Call Now
          </a>
          <a
            href={`https://wa.me/91${contact.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mag-contact__btn mag-contact__btn--whatsapp"
          >
            <FaWhatsapp size={14} />
            WhatsApp
          </a>
        </div>

        {/* Appointment Section */}
        <div className="mag-contact__divider"></div>

        <div className="mag-contact__appointment">
          <h4 className="mag-contact__appointment-title">
            <FiCalendar size={14} />
            Schedule a Visit
          </h4>

          <div className="mag-contact__appointment-grid">
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="mag-contact__input"
              min={new Date().toISOString().split("T")[0]}
            />
            <input
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="mag-contact__input"
            />
          </div>

          <button
            className="mag-contact__btn mag-contact__btn--appointment"
            disabled={!appointmentDate || !appointmentTime}
          >
            <FiCalendar size={14} />
            Book Appointment
          </button>
        </div>
      </div>
    );
  }

  // State 1: Not logged in — show masked contact + login button
  if (!user) {
    return (
      <div className="mag-contact mag-contact--locked">
        <div className="mag-contact__header">
          <div className="mag-contact__header-top">
            <FiLock size={16} className="mag-contact__icon--lock" />
            <span>Interested?</span>
          </div>
          <h3>Get in Touch</h3>
        </div>
        <div className="mag-contact__contact-block">
          <div className="mag-contact__field">
            <FiPhone size={16} />
            <span>{maskedPhone}</span>
          </div>
          <div className="mag-contact__field">
            <FiMail size={16} />
            <span>{maskedEmail}</span>
          </div>
        </div>
        <button
          onClick={() => openAuthModal("login", `/property/${propertyId}`)}
          className="btn-primary mag-contact__login-btn"
        >
          <FiLock size={14} />
          Login to View Contact
        </button>
      </div>
    );
  }

  // State 2: Logged in but not unlocked — show masked + unlock button
  return (
    <div className="mag-contact mag-contact--locked">
      <div className="mag-contact__header">
        <div className="mag-contact__header-top">
          <FiLock size={16} className="mag-contact__icon--lock" />
          <span>Interested?</span>
        </div>
        <h3>Get in Touch</h3>
      </div>
      <div className="mag-contact__contact-block">
        <div className="mag-contact__field">
          <FiPhone size={16} />
          <span>{maskedPhone}</span>
        </div>
        <div className="mag-contact__field">
          <FiMail size={16} />
          <span>{maskedEmail}</span>
        </div>
      </div>

      {error && <p className="mag-contact__error">{error}</p>}

      <button
        onClick={handleUnlock}
        disabled={loading || checking}
        className="btn-primary mag-contact__login-btn"
      >
        {loading ? (
          "Unlocking..."
        ) : checking ? (
          "Checking..."
        ) : (
          <>
            <FiUnlock size={14} />
            View Contact Details
          </>
        )}
      </button>
    </div>
  );
}

export default ContactUnlock;
