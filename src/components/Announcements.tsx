'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  speed: number;
}

export const Announcements: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Viewport Intersection Observer for Cinematic Entry Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.15, // Trigger when 15% of the section is visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // 2. Slow Drifting Background Particles (Canvas)
  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    const maxParticles = 30; // Kept sparse to match design system

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize slow, golden particles
    for (let i = 0; i < maxParticles; i++) {
      const size = Math.random() * 1.5 + 0.5;
      const baseAlpha = Math.random() * 0.2 + 0.08; // Low opacity to keep it atmospheric
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15, // Extremely slow drift
        vy: -Math.random() * 0.25 - 0.05,  // Always drifting slightly upward
        size,
        alpha: baseAlpha,
        baseAlpha,
        speed: Math.random() * 0.02 + 0.005,
      });
    }

    let time = 0;
    const renderLoop = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Drifting movement
        p.x += p.x < 0 ? canvas.width : p.x > canvas.width ? -canvas.width : p.vx;
        p.y += p.y < 0 ? canvas.height : p.y > canvas.height ? -canvas.height : p.vy;

        // Subtle alpha breathing/shimmering
        p.alpha = p.baseAlpha + Math.sin(time + p.x * 0.05) * 0.04;

        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        grad.addColorStop(0, `rgba(212, 175, 55, ${Math.max(0, p.alpha)})`);
        grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section 
      id="announcements" 
      ref={containerRef}
      className={`announcements-section ${isVisible ? 'visible' : ''}`}
    >
      {/* Drifting Golden Space Dust */}
      <canvas ref={canvasRef} className="announcements-canvas" />

      {/* Floating Glassmorphism Main Content Card */}
      <div className="announcements-card">
        <h2 className="card-heading">Announcements</h2>
        
        {/* Future-Ready content area (currently styled as an elegant empty state) */}
        <div className="announcements-content-wrapper">
          <div className="empty-state-container">
            <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="empty-state-title">No announcements at the moment.</p>
            <p className="empty-state-subtext">
              Stay tuned for upcoming events, registrations and important community updates.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .announcements-section {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          overflow: hidden;
          box-sizing: border-box;
          opacity: 0;
          transition: opacity 1.5s cubic-bezier(0.25, 1, 0.5, 1);
          border-top: 1px solid rgba(212, 175, 55, 0.1);
        }

        .announcements-section.visible {
          opacity: 1;
        }

        .announcements-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        .announcements-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 720px;
          min-height: 400px;
          background: rgba(15, 15, 15, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 16px;
          padding: 3.5rem 4rem;
          margin: 2rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65), 0 0 20px rgba(212, 175, 55, 0.05);
          box-sizing: border-box;
          text-align: center;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), 
                      transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }

        .announcements-section.visible .announcements-card {
          opacity: 1;
          transform: translateY(0);
          animation: floatCard 8s ease-in-out infinite 1.2s;
        }

        .card-heading {
          font-family: system-ui, sans-serif;
          font-size: 2.2rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #ffffff;
          margin: 0 0 2.5rem 0;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .announcements-content-wrapper {
          width: 100%;
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-state-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 460px;
        }

        .bell-icon {
          width: 32px;
          height: 32px;
          color: rgba(212, 175, 55, 0.6);
          margin-bottom: 1.5rem;
          animation: bellWobble 6s ease-in-out infinite;
        }

        .empty-state-title {
          font-family: system-ui, sans-serif;
          font-size: 1.2rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 0.75rem 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .empty-state-subtext {
          font-family: system-ui, sans-serif;
          font-size: 0.95rem;
          line-height: 1.7;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        @keyframes floatCard {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes bellWobble {
          0%, 85%, 100% {
            transform: rotate(0);
          }
          90% {
            transform: rotate(12deg);
          }
          92% {
            transform: rotate(-10deg);
          }
          94% {
            transform: rotate(6deg);
          }
          96% {
            transform: rotate(-4deg);
          }
          98% {
            transform: rotate(2deg);
          }
        }

        @media (max-width: 768px) {
          .announcements-card {
            padding: 2.5rem 2rem;
            margin: 1rem;
            min-height: auto;
          }
          .card-heading {
            font-size: 1.8rem;
          }
          .empty-state-title {
            font-size: 1.05rem;
          }
          .empty-state-subtext {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </section>
  );
};
