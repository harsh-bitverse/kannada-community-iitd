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

export const AboutUs: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lang, setLang] = useState<'en' | 'kn'>('en');
  const [isFading, setIsFading] = useState(false);

  // Hardcoded bilingual content to prevent layout shifts and translation delay
  const content = {
    en: {
      subheading: 'IIT Delhi',
      heading: 'About Kannada Community',
      text1: 'Welcome to the Kannada Community at IIT Delhi, a vibrant cultural collective dedicated to promoting the rich heritage, language, and traditions of Karnataka. We strive to create a welcoming home away from home for students, faculty, and scholars, fostering camaraderie through celebrate, worthy festivals, literary activities, and artistic assemblies.',
      text2: 'From Kannada Rajyotsava celebrations to language circles and classical music gatherings, our forums keep the spirit of Karnataka alive within the university ecosystem, building bridges of community and understanding.'
    },
    kn: {
      subheading: 'ಐಐಟಿ ದೆಹಲಿ',
      heading: 'ಕನ್ನಡ ಸಮುದಾಯದ ಬಗ್ಗೆ',
      text1: 'ಐಐಟಿ ದೆಹಲಿಯ ಕನ್ನಡ ಸಮುದಾಯಕ್ಕೆ ಸುಸ್ವಾಗತ. ಇದು ಕರ್ನಾಟಕದ ಶ್ರೀಮಂತ ಪರಂಪರೆ, ಭಾಷೆ ಮತ್ತು ಸಂಸ್ಕೃತಿಯನ್ನು ಪ್ರಚಾರ ಮಾಡಲು ಬದ್ಧವಾಗಿರುವ ಒಂದು ರೋಮಾಂಚಕ ಸಾಂಸ್ಕೃತಿಕ ಒಕ್ಕೂಟವಾಗಿದೆ. ನಾವು ವಿದ್ಯಾರ್ಥಿಗಳು, ಪ್ರಾಧ್ಯಾಪಕರು ಮತ್ತು ಸಂಶೋಧಕರಿಗೆ ಸುರಕ್ಷಿತ ಮತ್ತು ಸುಂದರವಾದ ವಾತಾವರಣವನ್ನು ಒದಗಿಸಲು ಶ್ರಮಿಸುತ್ತೇವೆ. ವಿವಿಧ ಸಾಂಸ್ಕೃತಿಕ ಹಬ್ಬಗಳು, ಸಾಹಿತ್ಯಿಕ ಚಟುವಟಿಕೆಗಳು ಮತ್ತು ಕಲಾತ್ಮಕ ಕೂಟಗಳ ಮೂಲಕ ನಮ್ಮಲ್ಲಿ ಸ್ನೇಹಭಾವವನ್ನು ಬೆಳೆಸುತ್ತೇವೆ.',
      text2: 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ಆಚರಣೆಗಳಿಂದ ಹಿಡಿದು ಭಾಷಾ ವಲಯಗಳು ಮತ್ತು ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತ ಸಭೆಗಳವರೆಗೆ, ನಮ್ಮ ವೇದಿಕೆಗಳು ವಿಶ್ವವಿದ್ಯಾಲಯದ ಪರಿಸರ ವ್ಯವಸ್ಥೆಯಲ್ಲಿ ಕರ್ನಾಟಕದ ಚೈತನ್ಯವನ್ನು ಜೀವಂತವಾಗಿರಿಸುತ್ತವೆ, ಸಮುದಾಯ ಮತ್ತು ತಿಳುವಳಿಕೆಯ ಸೇತುವೆಗಳನ್ನು ನಿರ್ಮಿಸುತ್ತವೆ.'
    }
  };

  // Viewport observer for entry transition
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

  // Drifting golden particles canvas simulation
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

    for (let i = 0; i < maxParticles; i++) {
      const size = Math.random() * 1.5 + 0.5;
      const baseAlpha = Math.random() * 0.25 + 0.1;
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
        p.alpha = p.baseAlpha + Math.sin(time + p.x * 0.05) * 0.05;

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

  const handleLanguageToggle = () => {
    setIsFading(true);
    setTimeout(() => {
      setLang((prev) => (prev === 'en' ? 'kn' : 'en'));
      setIsFading(false);
    }, 350); // Elegant 350ms fade duration
  };

  return (
    <section 
      id="about-us" 
      ref={containerRef}
      className={`about-us-section ${isVisible ? 'visible' : ''}`}
    >
      <canvas ref={canvasRef} className="about-canvas" />

      {/* Floating Glassmorphism Main Content Card */}
      <div className="about-card">
        <div 
          className="about-card-content"
          style={{ 
            opacity: isFading ? 0 : 1, 
            transition: 'opacity 350ms ease-in-out' 
          }}
        >
          <span className="card-subheading">{content[lang].subheading}</span>
          <h2 className="card-heading">{content[lang].heading}</h2>
          
          <p className="card-text">{content[lang].text1}</p>
          <p className="card-text">{content[lang].text2}</p>
        </div>

        {/* Pill-shaped Language Toggle Switch */}
        <button className="lang-toggle-btn" onClick={handleLanguageToggle}>
          <svg className="globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="toggle-label">{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
        </button>
      </div>

      <style jsx>{`
        .about-us-section {
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

        .about-us-section.visible {
          opacity: 1;
        }

        .about-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        .about-card {
          position: relative;
          z-index: 2;
          max-width: 720px;
          min-height: 480px; /* Preserve vertical volume to prevent layout jumping */
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
          justify-content: space-between;
          align-items: center;
        }

        .about-us-section.visible .about-card {
          opacity: 1;
          transform: translateY(0);
          animation: floatCard 8s ease-in-out infinite 1.2s;
        }

        .about-card-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .card-subheading {
          display: inline-block;
          font-family: system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 0.75rem;
        }

        .card-heading {
          font-family: system-ui, sans-serif;
          font-size: 2.2rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #ffffff;
          margin: 0 0 2rem 0;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .card-text {
          font-family: system-ui, sans-serif;
          font-size: 1.05rem;
          line-height: 1.85;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.75);
          margin: 0 0 1.5rem 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .card-text:last-of-type {
          margin-bottom: 2.5rem;
        }

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
          margin-top: auto;
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

        @keyframes floatCard {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @media (max-width: 768px) {
          .about-card {
            padding: 2.5rem 2rem;
            margin: 1rem;
            min-height: auto;
          }
          .card-heading {
            font-size: 1.8rem;
          }
          .card-text {
            font-size: 0.95rem;
            line-height: 1.7;
          }
        }
      `}</style>
    </section>
  );
};
