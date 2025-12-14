import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeContext';

const SettingsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  // Languages for the dropdown including common Indian languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'ur', name: 'Urdu' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'or', name: 'Odia' },
    { code: 'as', name: 'Assamese' },
    { code: 'mai', name: 'Maithili' },
    { code: 'sd', name: 'Sindhi' },
    { code: 'ks', name: 'Kashmiri' },
    { code: 'ne', name: 'Nepali' },
    { code: 'sa', name: 'Sanskrit' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLanguageChange = (event) => {
    const languageName = event.target.value;
    setSelectedLanguage(languageName);
    // In a real app, you would implement language switching logic here
    console.log(`Language changed to: ${languageName}`);
    
    // You can add actual language switching logic here
    // For example, storing the selection in localStorage
    localStorage.setItem('selectedLanguage', languageName);
  };

  return (
    <div className="settings-dropdown" ref={dropdownRef}>
      <button 
        className="settings-toggle"
        onClick={handleToggle}
        aria-label="Settings"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      </button>

      {isOpen && (
        <div className="settings-menu">
          <div className="settings-section">
            <h3>Theme</h3>
            <div className="setting-item">
              <span>Change Theme</span>
              <button 
                className={`theme-toggle-switch ${theme === 'dark' ? 'dark' : 'light'}`}
                onClick={handleThemeToggle}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="slider"></span>
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3>Language</h3>
            <div className="setting-item">
              <select 
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="language-select"
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.name}>
                    {language.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;