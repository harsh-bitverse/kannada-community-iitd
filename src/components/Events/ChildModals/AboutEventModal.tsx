'use client';

import React, { useEffect, useState } from 'react';

interface AboutEventModalProps {
  onClose: () => void;
}

export const AboutEventModal: React.FC<AboutEventModalProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'kn'>('en');
  const [isFading, setIsFading] = useState(false);
  const [enAboutText, setEnAboutText] = useState("This event celebrates the state foundation day of Karnataka, bringing together students and faculty to witness traditional dances, instrumental ensembles, literary forums, and dynamic cultural showcases. Join us in celebrating Karnataka's rich history, legacy, and linguistic pride.");
  const [knAboutText, setKnAboutText] = useState("ಈ ಕಾರ್ಯಕ್ರಮವು ಕರ್ನಾಟಕದ ಸಂಸ್ಥಾಪನಾ ದಿನವನ್ನು ಆಚರಿಸುತ್ತದೆ, ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ಬೋಧಕರನ್ನು ಒಟ್ಟುಗೂಡಿಸಿ ಸಾಂಪ್ರದಾಯಿಕ ನೃತ್ಯಗಳು, ವಾದ್ಯಗೋಷ್ಠಿಗಳು, ಸಾಹಿತ್ಯಿಕ ವೇದಿಕೆಗಳು ಮತ್ತು ಕ್ರಿಯಾತ್ಮಕ ಸಾಂಸ್ಕೃತಿಕ ಪ್ರದರ್ಶನಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಕರ್ನಾಟಕದ ಶ್ರೀಮಂತ ಇತಿಹಾಸ, ಪರಂಪರೆ ಮತ್ತು ಭಾಷಾ ಹೆಮ್ಮೆಯನ್ನು ಆಚರಿಸಲು ನಮ್ಮೊಂದಿಗೆ ಸೇರಿಕೊಳ್ಳಿ.");

  // Fetch dynamic about details from the event's data.json
  useEffect(() => {
    fetch('/events/kannada-rajyotsava-2025/data.json')
      .then((res) => res.json())
      .then((data) => {
        if (data.enAbout) setEnAboutText(data.enAbout);
        if (data.knAbout) setKnAboutText(data.knAbout);
      })
      .catch((err) => console.error('Failed to load about event text:', err));
  }, []);

  const content = {
    en: {
      title: 'About Event',
      desc: enAboutText
    },
    kn: {
      title: 'ಕಾರ್ಯಕ್ರಮದ ಬಗ್ಗೆ',
      desc: knAboutText
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 30);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    setTimeout(onClose, 400);
  };

  const handleLanguageToggle = () => {
    setIsFading(true);
    setTimeout(() => {
      setLang((prev) => (prev === 'en' ? 'kn' : 'en'));
      setIsFading(false);
    }, 350);
  };

  return (
    <div className={`child-modal-overlay ${isOpen ? 'active' : ''}`} onClick={handleDismiss}>
      <div 
        className={`child-modal-panel ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="child-close-btn" onClick={handleDismiss} aria-label="Close modal">
          ✕
        </button>

        <div className="child-modal-content">
          <div 
            className="content-fade-wrapper"
            style={{ 
              opacity: isFading ? 0 : 1, 
              transition: 'opacity 350ms ease-in-out',
              width: '100%',
              textAlign: 'center'
            }}
          >
            <h3 className="child-modal-title">{content[lang].title}</h3>
            <p className="child-desc-text">{content[lang].desc}</p>
          </div>

          {/* Bilingual Language Switcher (Reused style from AboutUs) */}
          <div className="toggle-btn-container">
            <button className="lang-toggle-btn" onClick={handleLanguageToggle}>
              <svg className="globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="toggle-label">{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .child-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100010;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.35);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease;
        }

        .child-modal-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        .child-modal-panel {
          position: relative;
          width: 65vw;
          height: 65vh;
          max-width: 1200px;
          max-height: 750px;
          background: rgba(20, 20, 20, 0.98);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.08);
          box-sizing: border-box;
          padding: 3.5rem 4rem;
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: scale(0.7) translateY(30px);
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
        }

        .child-modal-panel.open {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .child-close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          transition: transform 0.2s ease, background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
        }

        .child-close-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.6);
          color: #ffffff;
          transform: rotate(90deg) scale(1.05);
        }

        .child-modal-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .child-modal-title {
          font-family: system-ui, sans-serif;
          font-size: 2rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #ffffff;
          margin: 0 0 1.5rem 0;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .child-desc-text {
          font-family: system-ui, sans-serif;
          font-size: 1.05rem;
          line-height: 1.85;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.85);
          max-width: 680px;
          margin: 0 auto;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          min-height: 120px;
        }

        .toggle-btn-container {
          margin-top: 1.5rem;
        }

        /* Pill-shaped Language Toggle Switch */
        .lang-toggle-btn {
          background: rgba(212, 175, 55, 0.05);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #ffffff;
          padding: 0.7rem 1.8rem;
          border-radius: 30px;
          cursor: pointer;
          font-family: system-ui, sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), 0 0 5px rgba(212, 175, 55, 0.05);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                      background-color 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                      border-color 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                      box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .lang-toggle-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.7);
          transform: scale(1.03);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45), 0 0 12px rgba(212, 175, 55, 0.2);
        }

        .globe-icon {
          width: 14px;
          height: 14px;
          opacity: 0.85;
          transition: transform 0.4s ease;
        }

        .lang-toggle-btn:hover .globe-icon {
          transform: rotate(30deg);
        }

        @media (max-width: 768px) {
          .child-modal-panel {
            width: 85vw;
            height: 50vh;
            padding: 2rem;
          }
          .child-modal-title {
            font-size: 1.6rem;
          }
          .child-desc-text {
            font-size: 0.95rem;
            line-height: 1.7;
          }
        }
      `}</style>
    </div>
  );
};
export default AboutEventModal;
