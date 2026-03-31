import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiRobot2Line } from "react-icons/ri";
import "./ChatBot.css";

function ChatBot() {
  const [showBubble, setShowBubble] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/advertise");
  };

  return (
    <div
      className="chatbot"
      onMouseEnter={() => setShowBubble(true)}
      onMouseLeave={() => setShowBubble(false)}
    >
      {showBubble && (
        <div className="chatbot__bubble">
          <span className="chatbot__bubble-text">
            Grow your real estate business 10x!
          </span>
          <span className="chatbot__bubble-arrow" />
        </div>
      )}
      <button
        className="chatbot__button"
        onClick={handleClick}
        aria-label="Open advertising services"
      >
        <RiRobot2Line className="chatbot__icon" />
      </button>
    </div>
  );
}

export default ChatBot;
