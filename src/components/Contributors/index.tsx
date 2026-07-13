'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Contributor } from './ContributorCard';
import { ContributorRow } from './ContributorRow';

export const ContributorsSection: React.FC = () => {
  const [students, setStudents] = useState<Contributor[]>([]);
  const [faculty, setFaculty] = useState<Contributor[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch student and faculty contributors dynamically
  useEffect(() => {
    fetch('/contributors/students/data.json')
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error('Failed to load students metadata:', err));

    fetch('/contributors/faculty/data.json')
      .then((res) => res.json())
      .then((data) => setFaculty(data))
      .catch((err) => console.error('Failed to load faculty metadata:', err));
  }, []);

  // Intersection Entrance Fade-in Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Golden dust floating canvas particles background (Unified with AboutUs / Announcements)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
    }> = [];

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 800;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize 25 drifting particles
    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        speedY: -(Math.random() * 0.4 + 0.1),
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.5 + 0.1,
        fadeSpeed: (Math.random() - 0.5) * 0.005
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += p.fadeSpeed;

        // Reset particle position if it goes off top/sides or fades completely
        if (p.y < 0 || p.opacity <= 0 || p.opacity >= 0.7) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
          p.opacity = 0.1;
          p.fadeSpeed = (Math.random()) * 0.005;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="contributors" 
      className={`contributors-section ${isVisible ? 'fade-in' : ''}`}
    >
      {/* Drifting Golden Dust Background Canvas */}
      <canvas ref={canvasRef} className="contributors-bg-canvas" />

      <div className="contributors-container">
        {/* Center-aligned Section Header */}
        <div className="section-header">
          <span className="section-tag">Hall of Recognition</span>
          <h2 className="section-title">Community Contributors</h2>
          <div className="gold-divider" />
        </div>

        {/* Student Contributors Subsection */}
        {students.length > 0 && (
          <div className="contributors-subsection">
            <h3 className="subsection-title">Student Contributors</h3>
            <ContributorRow contributors={students} type="student" />
          </div>
        )}

        {/* Faculty Advisors Subsection */}
        {faculty.length > 0 && (
          <div className="contributors-subsection">
            <h3 className="subsection-title">Faculty Advisors</h3>
            <ContributorRow contributors={faculty} type="faculty" />
          </div>
        )}
      </div>

      <style jsx>{`
        .contributors-section {
          position: relative;
          min-height: 100vh;
          width: 100%;
          background: #080808;
          border-top: 1px solid #151515;
          padding: 6rem 4rem;
          box-sizing: border-box;
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), 
                      transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .contributors-section.fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        .contributors-bg-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .contributors-container {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        .section-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .section-tag {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 0.5rem;
        }

        .section-title {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 2.5rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #ffffff;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .gold-divider {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #d4af37, transparent);
        }

        .contributors-subsection {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }

        .subsection-title {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 1.5rem;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          border-left: 3px solid #d4af37;
          padding-left: 0.75rem;
        }

        @media (max-width: 768px) {
          .contributors-section {
            padding: 4rem 2rem;
          }
          .section-title {
            font-size: 2rem;
          }
          .subsection-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </section>
  );
};
export default ContributorsSection;
