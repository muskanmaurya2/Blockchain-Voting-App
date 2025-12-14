// Node module
import React, { useState } from "react";

const NotInit = () => {
  // Component: Displaying election not initialize message with email notification option.
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // In a real app, you would send this to your backend
    console.log("Email submitted for notification:", email);
    
    // Store in localStorage for demo purposes
    const notifications = JSON.parse(localStorage.getItem("electionNotifications") || "[]");
    notifications.push({ email, timestamp: new Date().toISOString() });
    localStorage.setItem("electionNotifications", JSON.stringify(notifications));
    
    setSubmitted(true);
    setError("");
  };

  return (
    <div className="container-item info">
      <center>
        <h3>The election has not been initialized.</h3>
        {!submitted ? (
          <>
            <p>Please enter your email to receive a notification when the election goes live:</p>
            <form onSubmit={handleSubmit} className="email-notification-form">
              <div className="form-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="email-input"
                />
                {error && <p className="error-message">{error}</p>}
              </div>
              <button type="submit" className="notify-button">
                Notify Me
              </button>
            </form>
          </>
        ) : (
          <p className="success-message">Thank you! You'll be notified when the election goes live.</p>
        )}
      </center>
    </div>
  );
};

export default NotInit;