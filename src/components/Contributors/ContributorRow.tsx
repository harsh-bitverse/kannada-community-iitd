'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Contributor, ContributorCard } from './ContributorCard';

interface ContributorRowProps {
  contributors: Contributor[];
  type: 'student' | 'faculty';
}

export const ContributorRow: React.FC<ContributorRowProps> = ({ contributors, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const rowRef = useRef<HTMLDivElement>(null);

  // Measure visible columns responsively based on container size
  useEffect(() => {
    const calculateVisibleCount = () => {
      if (rowRef.current) {
        const width = rowRef.current.clientWidth;
        // ContributorCard width is 220px, gap is 24px (total 244px spacing)
        const count = Math.max(1, Math.floor((width + 24) / 244));
        setVisibleCount(count);
      }
    };

    calculateVisibleCount();
    window.addEventListener('resize', calculateVisibleCount);
    return () => window.removeEventListener('resize', calculateVisibleCount);
  }, []);

  const totalCards = contributors.length;
  const isLeftDisabled = currentIndex === 0;
  const isRightDisabled = currentIndex >= totalCards - visibleCount;

  const handleSlideLeft = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleSlideRight = () => {
    const maxIndex = Math.max(0, totalCards - visibleCount);
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="contributor-row-wrapper">
      {/* Left Carousel Navigation Button */}
      <button 
        className={`carousel-nav-btn left ${isLeftDisabled ? 'disabled' : ''}`}
        onClick={handleSlideLeft}
        disabled={isLeftDisabled}
        aria-label="Slide left"
      >
        ‹
      </button>

      {/* Slider viewport mask container */}
      <div className="row-slider-container" ref={rowRef}>
        <div 
          className="slider-track"
          style={{
            transform: `translateX(-${currentIndex * 244}px)`
          }}
        >
          {contributors.map((contributor) => (
            <ContributorCard 
              key={contributor.id}
              contributor={contributor}
              type={type}
            />
          ))}
        </div>
      </div>

      {/* Right Carousel Navigation Button */}
      <button 
        className={`carousel-nav-btn right ${isRightDisabled ? 'disabled' : ''}`}
        onClick={handleSlideRight}
        disabled={isRightDisabled}
        aria-label="Slide right"
      >
        ›
      </button>

      <style jsx>{`
        .contributor-row-wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          box-sizing: border-box;
          position: relative;
        }

        .row-slider-container {
          flex-grow: 1;
          overflow: hidden;
          position: relative;
          padding: 0.5rem 0; /* Add top/bottom padding so cards glow is not clipped! */
          height: auto;
        }

        .slider-track {
          display: flex;
          gap: 24px;
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .carousel-nav-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 1.4rem;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background-color 0.25s, border-color 0.25s, opacity 0.25s, transform 0.2s;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          z-index: 5;
        }

        .carousel-nav-btn:hover:not(.disabled) {
          background: rgba(212, 175, 55, 0.2);
          border-color: rgba(212, 175, 55, 0.6);
          transform: scale(1.05);
        }

        .carousel-nav-btn.disabled {
          opacity: 0.25;
          cursor: not-allowed;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .contributor-row-wrapper {
            gap: 0.5rem;
          }
          .carousel-nav-btn {
            width: 30px;
            height: 30px;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};
export default ContributorRow;
