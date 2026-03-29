import { useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const navigate = useNavigate();
  const clickTimestamps = useRef([]);

  // Secret knock: click the footer brand logo 5 times within 3 seconds
  const handleBrandClick = useCallback(() => {
    const now = Date.now();
    clickTimestamps.current.push(now);

    // Keep only clicks from the last 3 seconds
    clickTimestamps.current = clickTimestamps.current.filter(
      (t) => now - t < 3000
    );

    if (clickTimestamps.current.length >= 5) {
      clickTimestamps.current = [];
      navigate("/admin/login", { state: { accessGranted: true } });
    }
  }, [navigate]);

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <h3 onClick={handleBrandClick} style={{ cursor: "default" }}>
            Chiku<span>Prop</span>
          </h3>
          <p>Find your dream property in India</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Browse</h4>
            <Link to="/buy">Buy Property</Link>
            <Link to="/rent">Rent Property</Link>
            <Link to="/wanted">Dream Home</Link>
          </div>
          <div className="footer-col">
            <h4>For Vendors</h4>
            <Link to="/add-property">List Property</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/services">Services</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2026 ChikuProp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
