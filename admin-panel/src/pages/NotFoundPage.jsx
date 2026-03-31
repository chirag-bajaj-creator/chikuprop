import { Link } from "react-router-dom";
import { FiHome, FiSearch, FiMapPin } from "react-icons/fi";
import { IoBedOutline } from "react-icons/io5";
import { BiArea, BiBuildings } from "react-icons/bi";
import { LuBath } from "react-icons/lu";
import "./NotFoundPage.css";

function NotFoundPage() {
  return (
    <div className="notfound-page">
      <div className="notfound-bg-icons">
        <FiHome className="notfound-bg-icon notfound-bg-icon--1" />
        <IoBedOutline className="notfound-bg-icon notfound-bg-icon--2" />
        <FiMapPin className="notfound-bg-icon notfound-bg-icon--3" />
        <BiArea className="notfound-bg-icon notfound-bg-icon--4" />
        <LuBath className="notfound-bg-icon notfound-bg-icon--5" />
        <BiBuildings className="notfound-bg-icon notfound-bg-icon--6" />
        <FiHome className="notfound-bg-icon notfound-bg-icon--7" />
        <FiMapPin className="notfound-bg-icon notfound-bg-icon--8" />
      </div>

      <div className="notfound-content">
        <div className="notfound-house">
          <div className="notfound-house__roof"></div>
          <div className="notfound-house__body">
            <div className="notfound-house__door"></div>
            <div className="notfound-house__window"></div>
            <div className="notfound-house__window"></div>
          </div>
        </div>

        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">This property doesn't exist</h2>
        <p className="notfound-text">
          Looks like you've wandered into an uncharted neighborhood.
          The page you're looking for has moved or never existed.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="notfound-btn notfound-btn--primary">
            <FiHome size={18} />
            Back to Home
          </Link>
          <Link to="/buy" className="notfound-btn notfound-btn--secondary">
            <FiSearch size={18} />
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
