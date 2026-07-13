'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GalleryImage {
  src: string;
  caption: string;
}

interface GalleryRow {
  id: string;
  images: GalleryImage[];
}

interface GalleryModalProps {
  onClose: () => void;
}

const GalleryImageCard: React.FC<GalleryImage> = ({ src, caption }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="gallery-image-card">
      {!hasError ? (
        <img 
          src={src} 
          alt={caption} 
          onError={() => setHasError(true)} 
          className="gallery-img"
        />
      ) : (
        <div className="gallery-img-fallback">
          <svg className="fallback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
      <div className="image-caption-overlay">
        <span className="caption-text">{caption}</span>
      </div>

      <style jsx>{`
        .gallery-image-card {
          position: relative;
          flex: 0 0 220px;
          height: 140px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
          box-sizing: border-box;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }

        .gallery-image-card:hover {
          border-color: rgba(212, 175, 55, 0.4);
          transform: translateY(-2px);
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-img-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(40, 40, 40, 0.9));
        }

        .fallback-icon {
          width: 32px;
          height: 32px;
          color: rgba(212, 175, 55, 0.4);
        }

        .image-caption-overlay {
          position: absolute;
          inset: auto 0 0 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
          padding: 0.75rem 0.5rem 0.5rem 0.5rem;
          box-sizing: border-box;
          text-align: center;
        }

        .caption-text {
          font-family: system-ui, sans-serif;
          font-size: 0.75rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.8);
          letter-spacing: 0.02em;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export const GalleryModal: React.FC<GalleryModalProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [galleryRows, setGalleryRows] = useState<GalleryRow[]>([]);
  const [rowIndices, setRowIndices] = useState<number[]>([0, 0, 0]);
  const [visibleCounts, setVisibleCounts] = useState<number[]>([3, 3, 3]);

  const rowRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null)
  ];

  // Fetch dynamic gallery content from data.json
  useEffect(() => {
    fetch('/events/kannada-rajyotsava-2025/data.json')
      .then((res) => res.json())
      .then((data) => {
        if (data.galleryRows) {
          setGalleryRows(data.galleryRows);
          setRowIndices(data.galleryRows.map(() => 0));
          setVisibleCounts(data.galleryRows.map(() => 3));
        }
      })
      .catch((err) => console.error('Failed to load gallery metadata:', err));
  }, []);

  // Sync entrance animations
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 30);
    return () => clearTimeout(timer);
  }, []);

  // Update visible counts responsively to clamp carousel slide limits
  useEffect(() => {
    if (!isOpen || galleryRows.length === 0) return;

    const calculateVisibleCounts = () => {
      rowRefs.forEach((ref, index) => {
        if (ref.current) {
          const width = ref.current.clientWidth;
          // Image card is 220px, gap is 16px (total 236px spacing)
          const count = Math.max(1, Math.floor((width + 16) / 236));
          setVisibleCounts((prev) => {
            const next = [...prev];
            next[index] = count;
            return next;
          });
        }
      });
    };

    calculateVisibleCounts();
    window.addEventListener('resize', calculateVisibleCounts);
    return () => window.removeEventListener('resize', calculateVisibleCounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, galleryRows]);

  const handleDismiss = () => {
    setIsOpen(false);
    setTimeout(onClose, 400);
  };

  const handleSlideLeft = (rowIndex: number) => {
    setRowIndices((prev) => {
      const next = [...prev];
      next[rowIndex] = Math.max(0, prev[rowIndex] - 1);
      return next;
    });
  };

  const handleSlideRight = (rowIndex: number, totalImages: number) => {
    setRowIndices((prev) => {
      const next = [...prev];
      const maxIndex = Math.max(0, totalImages - visibleCounts[rowIndex]);
      next[rowIndex] = Math.min(maxIndex, prev[rowIndex] + 1);
      return next;
    });
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
          <h3 className="child-modal-title">Gallery</h3>

          <div className="gallery-rows-container">
            {galleryRows.map((row, rowIndex) => {
              const totalImages = row.images.length;
              const currentIndex = rowIndices[rowIndex] || 0;
              const visibleCount = visibleCounts[rowIndex] || 3;
              const isLeftDisabled = currentIndex === 0;
              const isRightDisabled = currentIndex >= totalImages - visibleCount;

              return (
                <div key={row.id} className="gallery-row-wrapper">
                  {/* Left Carousel Navigation Button */}
                  <button 
                    className={`carousel-nav-btn left ${isLeftDisabled ? 'disabled' : ''}`}
                    onClick={() => handleSlideLeft(rowIndex)}
                    disabled={isLeftDisabled}
                  >
                    ‹
                  </button>

                  {/* Horizontal Scroll Area */}
                  <div className="row-slider-container" ref={rowRefs[rowIndex]}>
                    <div 
                      className="slider-track"
                      style={{
                        transform: `translateX(-${currentIndex * 236}px)`
                      }}
                    >
                      {row.images.map((img, imgIndex) => (
                        <GalleryImageCard 
                          key={imgIndex}
                          src={img.src}
                          caption={img.caption}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right Carousel Navigation Button */}
                  <button 
                    className={`carousel-nav-btn right ${isRightDisabled ? 'disabled' : ''}`}
                    onClick={() => handleSlideRight(rowIndex, totalImages)}
                    disabled={isRightDisabled}
                  >
                    ›
                  </button>
                </div>
              );
            })}
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

        .gallery-rows-container {
          width: 100%;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-y: auto;
          padding-right: 0.5rem;
          box-sizing: border-box;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.3) transparent;
        }

        .gallery-rows-container::-webkit-scrollbar {
          width: 6px;
        }

        .gallery-rows-container::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 3px;
        }

        .gallery-row-wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .row-slider-container {
          flex-grow: 1;
          overflow: hidden;
          position: relative;
          height: 144px;
        }

        .slider-track {
          display: flex;
          gap: 16px;
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .carousel-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background-color 0.25s, border-color 0.25s, opacity 0.25s, transform 0.2s;
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
          .gallery-row-wrapper {
            gap: 0.5rem;
          }
          .carousel-nav-btn {
            width: 28px;
            height: 28px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};
export default GalleryModal;
