'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GalleryModal } from './ChildModals/GalleryModal';
import { OrganizersModal } from './ChildModals/OrganizersModal';
import { AboutEventModal } from './ChildModals/AboutEventModal';

interface EventModalProps {
  enTitle: string;
  knTitle: string;
  enSubtitle: string;
  knSubtitle: string;
  enDescription: string;
  knDescription: string;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  enTitle,
  knTitle,
  enSubtitle,
  knSubtitle,
  enDescription,
  knDescription,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'kn'>('en');
  const [isFading, setIsFading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeChild, setActiveChild] = useState<'gallery' | 'organizers' | 'about' | null>(null);

  // Set mounted flag for server-side safety in Next.js
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Trigger spring scale-up entrance animation after mount
  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => setIsOpen(true), 30);
    return () => clearTimeout(timer);
  }, [isMounted]);

  // Lock scrolling on document body while the modal is open
  useEffect(() => {
    if (!isMounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMounted]);

  const handleDismiss = () => {
    setIsOpen(false);
    setTimeout(onClose, 500); // Matches the shrink transition duration
  };

  const handleLanguageToggle = () => {
    setIsFading(true);
    setTimeout(() => {
      setLang((prev) => (prev === 'en' ? 'kn' : 'en'));
      setIsFading(false);
    }, 350); // Matches the AboutUs toggle delay
  };

  if (!isMounted) return null;

  return createPortal(
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={handleDismiss}>
      <div 
        className={`modal-panel ${isOpen ? 'open' : ''} ${activeChild ? 'has-active-child' : ''}`} 
        onClick={(e) => e.stopPropagation()} // Prevent clicking modal content from closing it
      >
        {/* Circular Glass Close Button */}
        <button className="modal-close-btn" onClick={handleDismiss} aria-label="Close modal">
          ✕
        </button>

        {/* Modal Main Content Container */}
        <div className="modal-scroll-area">
          {/* Header Area (Subtitle & Title) */}
          <div 
            className="modal-header-fade"
            style={{ 
              opacity: isFading ? 0 : 1, 
              transition: 'opacity 350ms ease-in-out',
              textAlign: 'center'
            }}
          >
            <span className="modal-subtitle">{lang === 'en' ? enSubtitle : knSubtitle}</span>
            <h2 className="modal-title">{lang === 'en' ? enTitle : knTitle}</h2>
          </div>

          {/* Bilingual Language Switcher (Reused style from AboutUs) */}
          <div className="modal-toggle-container">
            <button className="lang-toggle-btn" onClick={handleLanguageToggle}>
              <svg className="globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="toggle-label">{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>
          </div>

          {/* Event Description (Below Language Toggle) */}
          <div 
            className="modal-body-fade"
            style={{ 
              opacity: isFading ? 0 : 1, 
              transition: 'opacity 350ms ease-in-out',
              width: '100%'
            }}
          >
            <p className="modal-description">
              {lang === 'en' ? enDescription : knDescription}
            </p>
          </div>

          {/* Glass Option Navigation Tiles */}
          <div className="modal-tiles-grid">
            <div className="navigation-tile" onClick={() => setActiveChild('gallery')}>
              <h4 className="tile-title">Gallery</h4>
              <p className="tile-desc">View event visual memories</p>
            </div>
            
            <div className="navigation-tile" onClick={() => setActiveChild('organizers')}>
              <h4 className="tile-title">Event Organizers</h4>
              <p className="tile-desc">Meet the management committee</p>
            </div>

            <div className="navigation-tile" onClick={() => setActiveChild('about')}>
              <h4 className="tile-title">About Event</h4>
              <p className="tile-desc">Read schedule details & timeline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Child Modal Mounts */}
      {activeChild === 'gallery' && (
        <GalleryModal onClose={() => setActiveChild(null)} />
      )}
      {activeChild === 'organizers' && (
        <OrganizersModal onClose={() => setActiveChild(null)} />
      )}
      {activeChild === 'about' && (
        <AboutEventModal onClose={() => setActiveChild(null)} />
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999; /* Higher than any navigation bar layer */
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0);
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1), 
                      backdrop-filter 0.5s cubic-bezier(0.25, 1, 0.5, 1),
                      background-color 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .modal-overlay.active {
          opacity: 1;
          pointer-events: auto;
          background-color: rgba(0, 0, 0, 0.25); /* Subtle dark overlay: ~25% */
          backdrop-filter: blur(18px) brightness(0.85); /* 18px backdrop blur */
          -webkit-backdrop-filter: blur(18px) brightness(0.85);
        }

        .modal-panel {
          position: relative;
          width: 80vw;
          height: 80vh;
          max-width: 1400px;
          max-height: 850px;
          background: rgba(15, 15, 15, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.1);
          box-sizing: border-box;
          padding: 4.5rem 5rem;
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: scale(0.7) translateY(50px);
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
        }

        .modal-panel.open {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .modal-panel.has-active-child {
          opacity: 0.65;
          filter: brightness(0.4) blur(1.5px);
          pointer-events: none;
          transform: scale(0.97);
        }

        .modal-close-btn {
          position: absolute;
          top: 2rem;
          right: 2rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: transform 0.2s ease, background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
        }

        .modal-close-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.6);
          color: #ffffff;
          transform: rotate(90deg) scale(1.05);
        }

        .modal-scroll-area {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          box-sizing: border-box;
          gap: 2rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.3) transparent;
        }

        .modal-scroll-area::-webkit-scrollbar {
          width: 6px;
        }

        .modal-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 3px;
        }

        .modal-content-fade {
          width: 100%;
          text-align: center;
        }

        .modal-subtitle {
          font-family: system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 0.75rem;
          display: block;
        }

        .modal-title {
          font-family: system-ui, sans-serif;
          font-size: 2.5rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #ffffff;
          margin: 0;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .modal-description {
          font-family: system-ui, sans-serif;
          font-size: 1.05rem;
          line-height: 1.85;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 auto;
          max-width: 800px;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          min-height: 130px; /* Preserve height context to minimize shifts */
        }

        .modal-toggle-container {
          margin: 0;
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

        /* Glass Option Tiles Grid */
        .modal-tiles-grid {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          width: 100%;
          max-width: 900px;
          margin-top: auto;
          box-sizing: border-box;
        }

        .navigation-tile {
          flex: 1;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      border-color 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      background-color 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .navigation-tile:hover {
          transform: translateY(-5px);
          background-color: rgba(212, 175, 55, 0.05);
          border-color: rgba(212, 175, 55, 0.5);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(212, 175, 55, 0.15);
        }

        .tile-title {
          font-family: system-ui, sans-serif;
          font-size: 1.1rem;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
          letter-spacing: 0.05em;
        }

        .tile-desc {
          font-family: system-ui, sans-serif;
          font-size: 0.8rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        @media (max-width: 900px) {
          .modal-panel {
            width: 90vw;
            height: 90vh;
            padding: 2.5rem;
          }
          .modal-title {
            font-size: 2rem;
          }
          .modal-tiles-grid {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};
