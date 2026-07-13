'use client';

import React, { useEffect, useState } from 'react';

interface Organizer {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface OrganizersModalProps {
  onClose: () => void;
}

const OrganizerProfileCard: React.FC<Organizer> = ({ name, role, avatar }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="organizer-profile-card">
      <div className="avatar-wrapper">
        {!hasError ? (
          <img 
            src={avatar} 
            alt={name} 
            onError={() => setHasError(true)} 
            className="avatar-img"
          />
        ) : (
          <div className="avatar-fallback">
            <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </div>
      <h4 className="organizer-name">{name}</h4>
      <p className="organizer-role">{role}</p>

      <style jsx>{`
        .organizer-profile-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 2rem 1.5rem;
          width: 100%;
          max-width: 220px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
          box-sizing: border-box;
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      border-color 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .organizer-profile-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.4);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.35), 0 0 15px rgba(212, 175, 55, 0.1);
        }

        .avatar-wrapper {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 1.25rem auto;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(212, 175, 55, 0.25);
          box-sizing: border-box;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 10, 10, 0.8);
        }

        .user-icon {
          width: 36px;
          height: 36px;
          color: rgba(212, 175, 55, 0.45);
        }

        .organizer-name {
          font-family: system-ui, sans-serif;
          font-size: 1.1rem;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 0.4rem 0;
          letter-spacing: 0.02em;
        }

        .organizer-role {
          font-family: system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export const OrganizersModal: React.FC<OrganizersModalProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);

  // Fetch dynamic list of organizers from public path
  useEffect(() => {
    fetch('/events/kannada-rajyotsava-2025/organizers.json')
      .then((res) => res.json())
      .then((data) => setOrganizers(data))
      .catch((err) => console.error('Failed to load organizers listing:', err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 30);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    setTimeout(onClose, 400);
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
          <h3 className="child-modal-title">Event Organizers</h3>
          
          <div className="organizers-list-container">
            {organizers.length > 0 ? (
              <div className="organizers-grid">
                {organizers.map((org) => (
                  <OrganizerProfileCard 
                    key={org.id}
                    id={org.id}
                    name={org.name}
                    role={org.role}
                    avatar={org.avatar}
                  />
                ))}
              </div>
            ) : (
              <div className="placeholder-wrapper">
                <p className="placeholder-text">Organizer profiles will be added here.</p>
              </div>
            )}
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
          padding: 3rem 4rem;
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
          justify-content: flex-start;
          box-sizing: border-box;
          overflow: hidden;
        }

        .child-modal-title {
          font-family: system-ui, sans-serif;
          font-size: 2rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #ffffff;
          margin: 0 0 2rem 0;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          flex-shrink: 0;
        }

        .organizers-list-container {
          width: 100%;
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          box-sizing: border-box;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.3) transparent;
        }

        .organizers-list-container::-webkit-scrollbar {
          width: 6px;
        }

        .organizers-list-container::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 3px;
        }

        .organizers-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2rem;
          width: 100%;
        }

        .placeholder-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-text {
          font-family: system-ui, sans-serif;
          font-size: 1.1rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.6);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 900px) {
          .child-modal-panel {
            width: 90vw;
            height: 90vh;
            padding: 2rem;
          }
          .child-modal-title {
            font-size: 1.6rem;
            margin-bottom: 1.5rem;
          }
          .organizers-grid {
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};
export default OrganizersModal;
