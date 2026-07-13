'use client';

import React from 'react';

interface EventCardProps {
  title: string;
  subtitle: string;
  onClick: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ title, subtitle, onClick }) => {
  return (
    <div className="event-card" onClick={onClick}>
      <span className="event-card-subtitle">{subtitle}</span>
      <h3 className="event-card-title">{title}</h3>
      <div className="event-card-action">
        <span>Explore Event</span>
        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>

      <style jsx>{`
        .event-card {
          background: rgba(15, 15, 15, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 16px;
          padding: 2.5rem 3rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 175, 55, 0.03);
          cursor: pointer;
          text-align: left;
          box-sizing: border-box;
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      border-color 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          animation: floatCard 8s ease-in-out infinite;
        }

        .event-card:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(212, 175, 55, 0.6);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.65), 0 0 20px rgba(212, 175, 55, 0.15);
        }

        .event-card-subtitle {
          display: inline-block;
          font-family: system-ui, sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 0.5rem;
        }

        .event-card-title {
          font-family: system-ui, sans-serif;
          font-size: 1.8rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: #ffffff;
          margin: 0 0 1.5rem 0;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .event-card-action {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: system-ui, sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          transition: color 0.25s ease;
        }

        .event-card:hover .event-card-action {
          color: #ffffff;
        }

        .arrow-icon {
          width: 14px;
          height: 14px;
          transition: transform 0.25s ease;
        }

        .event-card:hover .arrow-icon {
          transform: translateX(4px);
        }

        @keyframes floatCard {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @media (max-width: 768px) {
          .event-card {
            padding: 2rem;
            max-width: 100%;
          }
          .event-card-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};
