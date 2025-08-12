import { useState, useEffect } from "react";
import { FaClock, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const SessionStatus = () => {
  const { user, refreshSession } = useAuth();
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string>("");
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (!user) return;

    const updateSessionTime = () => {
      const sessionExpiry = localStorage.getItem("sessionExpiry");
      if (sessionExpiry) {
        const timeLeft = parseInt(sessionExpiry) - Date.now();
        if (timeLeft > 0) {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor(
            (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
          );
          setSessionTimeLeft(`${hours}h ${minutes}m`);

          // Show warning if less than 1 hour left
          setShowStatus(timeLeft < 60 * 60 * 1000);
        } else {
          setSessionTimeLeft("Expired");
          setShowStatus(true);
        }
      }
    };

    updateSessionTime();
    const interval = setInterval(updateSessionTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user]);

  if (!user || !showStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="glass-dark p-4 rounded-lg border border-yellow-500/20 max-w-sm">
        <div className="flex items-center space-x-2 mb-2">
          <FaShieldAlt className="text-yellow-400" />
          <span className="text-white font-medium">Session Status</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <FaClock className="text-yellow-400" />
          <span className="text-gray-300">
            {sessionTimeLeft === "Expired" ? (
              <span className="text-red-400">Session expired</span>
            ) : (
              <span>Expires in {sessionTimeLeft}</span>
            )}
          </span>
        </div>
        {sessionTimeLeft !== "Expired" && (
          <button
            onClick={refreshSession}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Extend session
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionStatus;
