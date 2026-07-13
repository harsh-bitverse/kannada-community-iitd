'use client';

import React, { useEffect, useRef, useState } from 'react';

export const JoinUs: React.FC = () => {
  const [name, setName] = useState('');
  const [entryNumber, setEntryNumber] = useState('');
  const [password, setPassword] = useState('');

  // Validation States
  const [errors, setErrors] = useState<{ name?: string; entryNumber?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Intersection observer entrance fade-in
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

  // Golden dust particles drifting background canvas (unified design language)
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

    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        speedY: -(Math.random() * 0.35 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        fadeSpeed: (Math.random() - 0.5) * 0.004
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += p.fadeSpeed;

        if (p.y < 0 || p.opacity <= 0 || p.opacity >= 0.6) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
          p.opacity = 0.1;
          p.fadeSpeed = (Math.random()) * 0.004;
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; entryNumber?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!entryNumber.trim()) {
      newErrors.entryNumber = 'Entry number is required';
    } else if (!/^[0-9]{4}[a-zA-Z0-9]{5,7}$/.test(entryNumber.trim())) {
      newErrors.entryNumber = 'Invalid IIT Delhi Entry Number (e.g. 2021CS10123)';
    }
    if (!password) {
      newErrors.password = 'Kerberos password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      // Simulate authentication request delay (900ms)
      // Standard dummy verification logic decoupled from the actual backend verification function
      simulateKerberosAuth({ name, entryNumber, password })
        .then((success) => {
          if (success) {
            setIsSuccess(true);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  };

  // Standalone simulated authentication logic
  // Easily replaceable with real Kerberos OAuth fetch endpoint later
  const simulateKerberosAuth = async (_credentials: Record<string, string>): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Always succeeds if client validated
      }, 950);
    });
  };

  return (
    <section 
      ref={sectionRef} 
      id="join-us" 
      className={`join-section ${isVisible ? 'fade-in' : ''}`}
    >
      <canvas ref={canvasRef} className="join-bg-canvas" />

      <div className="join-container">
        {/* Main Floating Glassmorphic Authentication Card */}
        <div className="join-card">
          {!isSuccess ? (
            <div className="form-wrapper">
              <span className="join-tag">Final Step</span>
              <h2 className="join-title">Join the Kannada Community</h2>
              <p className="join-subtitle">Become a part of the Kannada Community at IIT Delhi.</p>

              <form onSubmit={handleVerify} className="auth-form">
                {/* Full Name Input Field */}
                <div className="form-group">
                  <label htmlFor="name-input" className="form-label">Full Name</label>
                  <input
                    id="name-input"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <span className="inline-error-msg">{errors.name}</span>}
                </div>

                {/* Entry Number Input Field */}
                <div className="form-group">
                  <label htmlFor="entry-input" className="form-label">Entry Number</label>
                  <input
                    id="entry-input"
                    type="text"
                    placeholder="Enter your IIT Delhi entry number"
                    value={entryNumber}
                    onChange={(e) => setEntryNumber(e.target.value)}
                    disabled={isLoading}
                    className={`form-input ${errors.entryNumber ? 'error' : ''}`}
                  />
                  {errors.entryNumber && <span className="inline-error-msg">{errors.entryNumber}</span>}
                </div>

                {/* Kerberos Password Input Field */}
                <div className="form-group">
                  <label htmlFor="password-input" className="form-label">Kerberos Password</label>
                  <input
                    id="password-input"
                    type="password"
                    placeholder="Enter your Kerberos password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                  />
                  {errors.password && <span className="inline-error-msg">{errors.password}</span>}
                </div>

                {/* Action button container */}
                <button type="submit" disabled={isLoading} className="submit-auth-btn">
                  {isLoading ? (
                    <div className="spinner-wrapper">
                      <div className="loading-spinner" />
                      <span>Verifying Identity...</span>
                    </div>
                  ) : (
                    'Verify Identity'
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="success-wrapper">
              <div className="success-icon-wrapper">
                <svg className="success-check-icon" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h2 className="success-title">Welcome to the Kannada Community!</h2>
              <p className="success-message">
                You&apos;re all set. Join our official WhatsApp community to stay connected with announcements, events, and updates.
              </p>

              <a 
                href="https://chat.whatsapp.com/Jj1VR0H7erLDtoUytr3F2r" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="whatsapp-invite-btn"
              >
                <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.002 5.283 5.285.001 11.784.001c3.149 0 6.107 1.227 8.332 3.457 2.227 2.228 3.453 5.188 3.452 8.34-.002 6.5-5.285 11.782-11.784 11.782-2.003 0-3.974-.51-5.713-1.482L0 24zm6.59-4.817c1.66.987 3.298 1.489 5.19 1.49 5.372 0 9.742-4.37 9.744-9.743 0-2.6-1.012-5.048-2.85-6.887C16.84 2.204 14.394 1.19 11.79 1.19c-5.37 0-9.741 4.371-9.743 9.744-.001 2.023.542 3.415 1.503 4.965l-.999 3.647 3.737-.98c1.558.85 2.8 1.282 4.359 1.282zm11.21-6.195c-.3-.15-1.776-.876-2.05-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.174-.175.2-.35.225-.65.075-.3-.15-1.265-.466-2.41-1.488-.89-.794-1.49-1.775-1.665-2.075-.175-.3-.019-.462.13-.611.136-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52-.172-.007-.368-.012-.565-.012-.196 0-.518.073-.787.367-.27.293-1.03.88-1.03 2.146 0 1.265.92 2.49 1.05 2.66 1.34 1.76 2.6 2.87 5.14 3.78.6.21 1.07.34 1.44.46.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.15-.53-.3z"/>
                </svg>
                Join WhatsApp Community
              </a>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .join-section {
          position: relative;
          min-height: 100vh;
          width: 100%;
          background: #0c0c0c;
          border-top: 1px solid #151515;
          padding: 6rem 4rem;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), 
                      transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .join-section.fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        .join-bg-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .join-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 580px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
        }

        .join-card {
          width: 100%;
          background: rgba(15, 15, 15, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          padding: 3.5rem 3rem;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.08);
          box-sizing: border-box;
          animation: floatCard 8s ease-in-out infinite;
        }

        @keyframes floatCard {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .form-wrapper, .success-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .join-tag {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 0.5rem;
        }

        .join-title {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 2rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #ffffff;
          margin: 0 0 0.75rem 0;
          text-transform: uppercase;
        }

        .join-subtitle {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.95rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 2.5rem 0;
          line-height: 1.5;
        }

        .auth-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .form-label {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.75);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .form-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #ffffff;
          padding: 0.85rem 1rem;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.95rem;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease;
        }

        .form-input:focus {
          border-color: rgba(212, 175, 55, 0.6);
          background-color: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
        }

        .form-input.error {
          border-color: rgba(255, 77, 77, 0.5);
          background-color: rgba(255, 77, 77, 0.02);
        }

        .inline-error-msg {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.75rem;
          color: rgba(255, 77, 77, 0.85);
          margin-top: 0.1rem;
          display: block;
        }

        .submit-auth-btn {
          margin-top: 1rem;
          background: linear-gradient(90deg, #b8860b, #d4af37);
          border: none;
          border-radius: 8px;
          color: #000000;
          padding: 1rem;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.25);
          transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.25s ease;
        }

        .submit-auth-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
          filter: brightness(1.05);
        }

        .submit-auth-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-auth-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Spinner & Loading */
        .spinner-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #000000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Success screen layouts */
        .success-icon-wrapper {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.75rem;
          opacity: 0;
          transform: scale(0.6);
          animation: scaleUpIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .success-check-icon {
          width: 36px;
          height: 36px;
        }

        .success-title {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 1.8rem;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 1rem 0;
          opacity: 0;
          animation: fadeInText 0.4s ease forwards 0.2s;
        }

        .success-message {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 1rem;
          line-height: 1.6;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.7);
          max-width: 440px;
          margin: 0 0 2.5rem 0;
          opacity: 0;
          animation: fadeInText 0.4s ease forwards 0.3s;
        }

        .whatsapp-invite-btn {
          background: linear-gradient(90deg, #128c7e, #25d366);
          border: none;
          border-radius: 8px;
          color: #ffffff;
          padding: 1.1rem 2rem;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(37, 211, 102, 0.25);
          opacity: 0;
          transform: translateY(15px);
          animation: slideUpIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.4s;
          transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.25s ease;
        }

        .whatsapp-invite-btn:hover {
          transform: translateY(14px) scale(1.02);
          box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4);
          filter: brightness(1.05);
        }

        .whatsapp-icon {
          width: 18px;
          height: 18px;
        }

        @keyframes scaleUpIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInText {
          to {
            opacity: 1;
          }
        }

        @keyframes slideUpIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .join-section {
            padding: 4rem 2rem;
          }
          .join-card {
            padding: 2.5rem 1.75rem;
          }
          .join-title {
            font-size: 1.6rem;
          }
          .success-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
};
export default JoinUs;
