'use client';

import React, { useEffect, useRef, useState } from 'react';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';

interface EventItem {
  id: string;
  enTitle: string;
  knTitle: string;
  enSubtitle: string;
  knSubtitle: string;
  enDescription: string;
  knDescription: string;
}

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

export const Events: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Hardcoded initial event data (extensible in the future)
  const eventsList: EventItem[] = [
    {
      id: 'kannada-rajyotsava-2025',
      enTitle: 'Kannada Rajyotsava 2025',
      knTitle: 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ೨೦೨೫',
      enSubtitle: 'Cultural Celebration',
      knSubtitle: 'ಸಾಂಸ್ಕೃತಿಕ ಸಂಭ್ರಮ',
      enDescription: "Kannada Rajyotsava 2025 marks a grand celebration of Karnataka's foundation day at IIT Delhi. This cultural extravaganza brings together students, faculty, and scholars to witness spectacular showcases of Karnataka's heritage. The evening will be adorned with traditional dance performances (Dollu Kunitha, Yakshagana), live instrumental ensembles, literary forums, and culinary exhibitions featuring authentic Kannada cuisine. Come join us in celebrating the state's rich legacy and linguistic pride in its full glory.",
      knDescription: 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ೨೦೨೫ ಐಐಟಿ ದೆಹಲಿಯಲ್ಲಿ ಕರ್ನಾಟಕದ ಸಂಸ್ಥಾಪನಾ ದಿನದ ಭವ್ಯ ಆಚರಣೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಈ ಸಾಂಸ್ಕೃತಿಕ ಹಬ್ಬವು ಕರ್ನಾಟಕದ ಪರಂಪರೆಯ ಅದ್ಭುತ ಪ್ರದರ್ಶನಗಳಿಗೆ ಸಾಕ್ಷಿಯಾಗಲು ವಿದ್ಯಾರ್ಥಿಗಳು, ಬೋಧಕರು ಮತ್ತು ಸಂಶೋಧಕರನ್ನು ಒಟ್ಟುಗೂಡಿಸುತ್ತದೆ. ಈ ಸಂಜೆಯು ಸಾಂಪ್ರದಾಯಿಕ ನೃತ್ಯ ಪ್ರದರ್ಶನಗಳು (ಡೊಳ್ಳು ಕುಣಿತ, ಯಕ್ಷಗಾನ), ನೇರ ವಾದ್ಯಗೋಷ್ಠಿಗಳು, ಸಾಹಿತ್ಯಿಕ ವೇದಿಕೆಗಳು ಮತ್ತು ಅಧಿಕೃತ ಕನ್ನಡ ಪಾಕಪದ್ಧತಿಯನ್ನು ಒಳಗೊಂಡಿರುವ ಭೋಜನ ಪ್ರದರ್ಶನಗಳಿಂದ ಅಲಂಕರಿಸಲ್ಪಡುತ್ತದೆ. ರಾಜ್ಯದ ಶ್ರೀಮಂತ ಪರಂಪರೆ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಹೆಮ್ಮೆಯನ್ನು ಆಚರಿಸಲು ನಮ್ಮೊಂದಿಗೆ ಕೈಜೋಡಿಸಿ.'
    }
  ];

  // 1. Viewport Intersection Observer for Entry Transition
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.15,
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
    const maxParticles = 30;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize slow, golden particles
    for (let i = 0; i < maxParticles; i++) {
      const size = Math.random() * 1.5 + 0.5;
      const baseAlpha = Math.random() * 0.2 + 0.08;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.25 - 0.05,
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
        p.x += p.x < 0 ? canvas.width : p.x > canvas.width ? -canvas.width : p.vx;
        p.y += p.y < 0 ? canvas.height : p.y > canvas.height ? -canvas.height : p.vy;
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
      id="events" 
      ref={containerRef}
      className={`events-section ${isVisible ? 'visible' : ''}`}
    >
      <canvas ref={canvasRef} className="events-canvas" />

      {/* Main Events Cards Container */}
      <div className="events-container">
        <h2 className="section-heading">Events</h2>
        
        {/* Dynamic event loop (supports future expansions) */}
        <div className="events-grid">
          {eventsList.map((item) => (
            <EventCard 
              key={item.id}
              title={item.enTitle}
              subtitle={item.enSubtitle}
              onClick={() => setSelectedEvent(item)}
            />
          ))}
        </div>
      </div>

      {/* Expanded Event Details Overlay */}
      {selectedEvent && (
        <EventModal 
          enTitle={selectedEvent.enTitle}
          knTitle={selectedEvent.knTitle}
          enSubtitle={selectedEvent.enSubtitle}
          knSubtitle={selectedEvent.knSubtitle}
          enDescription={selectedEvent.enDescription}
          knDescription={selectedEvent.knDescription}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <style jsx>{`
        .events-section {
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

        .events-section.visible {
          opacity: 1;
        }

        .events-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        .events-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          padding: 4rem 2rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), 
                      transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .events-section.visible .events-container {
          opacity: 1;
          transform: translateY(0);
        }

        .section-heading {
          font-family: system-ui, sans-serif;
          font-size: 2.2rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #ffffff;
          margin: 0 0 3.5rem 0;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .events-grid {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 2rem;
          width: 100%;
        }

        @media (max-width: 768px) {
          .events-container {
            padding: 2.5rem 1rem;
          }
          .section-heading {
            font-size: 1.8rem;
            margin-bottom: 2.5rem;
          }
          .events-grid {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </section>
  );
};
export default Events;
