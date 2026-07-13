'use client';

import React, { useState } from 'react';

export interface Contributor {
  id: string;
  name: string;
  role: string;
  photo: string;
  linkedin?: string;
  instagram?: string;
  email?: string;
}

interface ContributorCardProps {
  contributor: Contributor;
  type: 'student' | 'faculty';
}

export const ContributorCard: React.FC<ContributorCardProps> = ({ contributor, type }) => {
  const [hasError, setHasError] = useState(false);
  const { name, role, photo, linkedin, instagram, email } = contributor;

  return (
    <div className="contributor-card">
      <div className="avatar-container">
        {!hasError ? (
          <img 
            src={photo} 
            alt={name} 
            onError={() => setHasError(true)} 
            className="avatar-img"
          />
        ) : (
          <div className="avatar-fallback">
            <svg className="fallback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </div>

      <h4 className="contributor-name">{name}</h4>
      <p className="contributor-role">{role}</p>

      <div className="social-links">
        {linkedin && (
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label={`${name}'s LinkedIn`}>
            <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        )}

        {type === 'student' && instagram && (
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label={`${name}'s Instagram`}>
            <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        )}

        {type === 'faculty' && email && (
          <a href={`mailto:${email}`} className="social-icon-link" aria-label={`Email ${name}`}>
            <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </a>
        )}
      </div>

      <style jsx>{`
        .contributor-card {
          flex: 0 0 220px;
          background: rgba(15, 15, 15, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 2.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          box-sizing: border-box;
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      border-color 0.35s cubic-bezier(0.25, 1, 0.5, 1),
                      box-shadow 0.35s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .contributor-card:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(212, 175, 55, 0.45);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.15);
        }

        .avatar-container {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(212, 175, 55, 0.2);
          box-sizing: border-box;
          transition: border-color 0.3s ease;
        }

        .contributor-card:hover .avatar-container {
          border-color: rgba(212, 175, 55, 0.6);
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

        .fallback-icon {
          width: 38px;
          height: 38px;
          color: rgba(212, 175, 55, 0.4);
        }

        .contributor-name {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 1.1rem;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
          letter-spacing: 0.02em;
        }

        .contributor-role {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.82rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.5);
          margin: 0 0 1.25rem 0;
          line-height: 1.4;
          height: 2.4rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .social-links {
          display: flex;
          gap: 1.25rem;
          margin-top: auto;
        }

        .social-icon-link {
          color: rgba(255, 255, 255, 0.6);
          transition: color 0.25s ease, transform 0.2s ease;
        }

        .social-icon-link:hover {
          color: #d4af37;
          transform: scale(1.1);
        }

        .social-icon {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
};
export default ContributorCard;
