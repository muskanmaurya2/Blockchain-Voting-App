import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="developer-info">
          <span className="developer-name">Developed by Muskan Maurya</span>
        </div>
        <div className="social-links">
          <a 
            href="https://www.linkedin.com/in/muskan-maurya-2b1b6a266/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link linkedin"
            aria-label="LinkedIn Profile"
          >
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a 
            href="https://www.instagram.com/_muskan_maurya_4" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link instagram"
            aria-label="Instagram Profile"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a 
            href="https://www.youtube.com/@muskan046" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link youtube"
            aria-label="YouTube Channel"
          >
            <i className="fab fa-youtube"></i>
          </a>
          <a 
            href="https://github.com/muskanmaurya2" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link github"
            aria-label="GitHub Profile"
          >
            <i className="fab fa-github"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;