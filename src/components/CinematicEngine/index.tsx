'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollEngine } from './ScrollEngine';
import { VideoEngine } from './VideoEngine';
import { SceneManager } from './SceneManager';
import { IntroOverlay } from './IntroOverlay';
import { Chapter, EngineState } from './types';

// requestAnimationFrame helper for cubic volume fade-in
function fadeAudio(
  audio: HTMLAudioElement,
  targetVolume: number,
  durationSeconds: number,
  onComplete?: () => void
): () => void {
  const startVolume = audio.volume;
  const volumeDiff = targetVolume - startVolume;

  if (volumeDiff === 0 || durationSeconds <= 0) {
    audio.volume = targetVolume;
    if (onComplete) onComplete();
    return () => {};
  }

  const durationMs = durationSeconds * 1000;
  const startTime = performance.now();
  let animationId: number;

  const tick = (now: number) => {
    const elapsed = now - startTime;

    if (elapsed >= durationMs) {
      audio.volume = targetVolume;
      if (onComplete) onComplete();
      return;
    }

    const progress = elapsed / durationMs;
    // Cubic ease-in-out curve
    const easeProgress = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const nextVolume = startVolume + volumeDiff * easeProgress;
    audio.volume = Math.max(0, Math.min(1, nextVolume));

    animationId = requestAnimationFrame(tick);
  };

  animationId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(animationId);
  };
}

interface CinematicEngineProps {
  chapters: Chapter[];
  onStateChange?: (state: EngineState) => void;
  hasCinematicVideos?: boolean;
}

export const CinematicEngine: React.FC<CinematicEngineProps> = ({
  chapters,
  onStateChange,
  hasCinematicVideos = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const chapter1AudioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedChapter1Audio = useRef(false);


  const [isLoading, setIsLoading] = useState(hasCinematicVideos);
  const [introComplete, setIntroComplete] = useState(false);
  const [activeSection, setActiveSection] = useState('karnataka');

  const [engineState, setEngineState] = useState<EngineState>({
    globalProgress: 0,
    activeChapterId: null,
    localProgress: 0,
    scrollDirection: 0,
    isPreloading: false,
  });

  // Lock document scroll while the intro is active
  useEffect(() => {
    if (!introComplete) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [introComplete]);



  // Set up Engines and SceneManager
  useEffect(() => {
    if (!containerRef.current || !videoRefA.current || !videoRefB.current) return;

    const videoA = videoRefA.current;
    const videoB = videoRefB.current;

    // Initialize Video Engine
    const videoEngine = new VideoEngine(videoA, videoB);

    // Initialize Scene Manager
    const sceneManager = new SceneManager(
      chapters,
      videoEngine,
      (state) => {
        setEngineState(state);
        if (onStateChange) {
          onStateChange(state);
        }
      }
    );

    // Initialize Scroll Engine
    const scrollEngine = new ScrollEngine(
      containerRef.current,
      chapters.length,
      (progress, direction) => {
        if (introComplete) {
          sceneManager.handleScrollUpdate(progress, direction);
        }
      }
    );

    const activeVideo = videoEngine.getActiveVideo();
    const handleMetadataLoaded = () => {
      setIsLoading(false);
      sceneManager.handleScrollUpdate(0, 0);
      scrollEngine.refresh();
    };

    if (hasCinematicVideos) {
      if (activeVideo.readyState >= 1) {
        handleMetadataLoaded();
      } else {
        activeVideo.addEventListener('loadedmetadata', handleMetadataLoaded);
      }
    }

    if (introComplete) {
      scrollEngine.refresh();
    }

    return () => {
      activeVideo.removeEventListener('loadedmetadata', handleMetadataLoaded);
      scrollEngine.destroy();
      videoEngine.destroy();
    };
  }, [chapters, onStateChange, introComplete, hasCinematicVideos]);

  // Track active section and scroll threshhold on user scroll
  useEffect(() => {
    if (!introComplete) return;

    const handleWindowScroll = () => {
      const scrollY = window.scrollY;



      // Track active layout sections
      const sections = ['karnataka', 'about-us', 'announcements', 'events', 'join-us'];
      let active = 'karnataka';

      sections.forEach((sec) => {
        if (sec === 'karnataka') return;
        const el = document.getElementById(sec);
        if (el && scrollY >= el.offsetTop - window.innerHeight / 3) {
          active = sec;
        }
      });

      setActiveSection(active);
    };

    window.addEventListener('scroll', handleWindowScroll);
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [introComplete]);

  // Manage Chapter 1 soundtrack startup, looping, re-entry and fade-out on section exit
  useEffect(() => {
    if (!introComplete) return;

    let cancelActiveFade: (() => void) | null = null;
    let startupTimer: ReturnType<typeof setTimeout> | undefined;
    let activeInteractionListener: (() => void) | null = null;

    const playAudio = () => {
      if (typeof window === 'undefined') return;
      if (chapter1AudioRef.current) return; // Prevent double play

      const audio = new Audio('/audio/chapter-1.mp3');
      audio.loop = true;
      audio.volume = 0;
      chapter1AudioRef.current = audio;

      audio.play().then(() => {
        if (cancelActiveFade) cancelActiveFade();
        cancelActiveFade = fadeAudio(audio, chapters[0]?.audioVolume || 0.8, 0.8);
      }).catch((err) => {
        console.warn('Autoplay blocked Chapter 1 audio. Registering interaction listeners.', err);
        const playOnInteraction = () => {
          audio.play().then(() => {
            if (cancelActiveFade) cancelActiveFade();
            cancelActiveFade = fadeAudio(audio, chapters[0]?.audioVolume || 0.8, 0.8);
          }).catch(() => {});
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('scroll', playOnInteraction);
        };
        activeInteractionListener = playOnInteraction;
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
        document.addEventListener('scroll', playOnInteraction);
      });
    };

    if (activeSection === 'karnataka') {
      if (!hasStartedChapter1Audio.current) {
        hasStartedChapter1Audio.current = true;
        // First startup: wait 500ms
        startupTimer = setTimeout(() => {
          playAudio();
        }, 500);
      } else {
        // Re-entry: play immediately
        playAudio();
      }
    } else {
      // Exiting Chapter 1 (e.g. going to About Us): fade-out over 800ms, then stop
      if (chapter1AudioRef.current) {
        const audio = chapter1AudioRef.current;
        chapter1AudioRef.current = null; // Clear reference to prevent conflicts

        cancelActiveFade = fadeAudio(audio, 0, 0.8, () => {
          audio.pause();
          audio.src = '';
        });
      }
    }

    return () => {
      if (startupTimer) clearTimeout(startupTimer);
      if (cancelActiveFade) cancelActiveFade();
      if (activeInteractionListener) {
        document.removeEventListener('click', activeInteractionListener);
        document.removeEventListener('touchstart', activeInteractionListener);
        document.removeEventListener('scroll', activeInteractionListener);
      }
    };
  }, [activeSection, introComplete, chapters]);

  // Custom GSAP Scroll transition to avoid hard page jumps
  const handleScrollToSection = (sectionId: string) => {
    let targetOffset = 0;
    if (sectionId !== 'karnataka') {
      const el = document.getElementById(sectionId);
      if (el) {
        targetOffset = el.offsetTop;
      } else {
        return;
      }
    }

    const scrollObj = { y: window.scrollY };
    gsap.to(scrollObj, {
      y: targetOffset,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        window.scrollTo(0, scrollObj.y);
      },
    });
  };

  const isCurrentChapter1 = 
    engineState.activeChapterId === chapters[0]?.id && 
    engineState.globalProgress < 1.0;

  return (
    <div ref={containerRef} className="cinematic-container">
      <div className="cinematic-viewport">
        {/* Dual Video Players */}
        <video 
          ref={videoRefA} 
          className="cinematic-video" 
          style={{ display: hasCinematicVideos ? 'block' : 'none' }}
        />
        <video 
          ref={videoRefB} 
          className="cinematic-video" 
          style={{ display: hasCinematicVideos ? 'block' : 'none' }}
        />

        {!introComplete && (
          <IntroOverlay onComplete={() => setIntroComplete(true)} />
        )}

        {/* Video Loading Indicator */}
        {hasCinematicVideos && introComplete && isLoading && (
          <div className="cinematic-loader">
            <div className="spinner" />
          </div>
        )}

        {/* Global Premium Navigation Interface */}
        {introComplete && (
          <nav className="global-nav">
            <div className="nav-brand">Kannada</div>
            <ul className="nav-links">
              {[
                { id: 'karnataka', label: 'Karnataka' },
                { id: 'about-us', label: 'About Us' },
                { id: 'announcements', label: 'Announcements' },
                { id: 'events', label: 'Events' },
                { id: 'join-us', label: 'Join Us' },
              ].map((item) => (
                <li 
                  key={item.id}
                  onClick={() => handleScrollToSection(item.id)}
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                >
                  <span className="dot">○</span>
                  <span className="active-dot">●</span>
                  <span className="nav-label">{item.label}</span>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Subtle Floating Controls (Active only in Chapter 1) */}
        {introComplete && isCurrentChapter1 && (
          <>
            {/* 1. Scroll to Explore Button */}
            <button 
              onClick={() => {
                const scrollObj = { y: window.scrollY };
                gsap.to(scrollObj, {
                  y: window.innerHeight * 0.5,
                  duration: 1.2,
                  ease: 'power2.out',
                  onUpdate: () => {
                    window.scrollTo(0, scrollObj.y);
                  },
                });
              }}
              className="explore-btn"
            >
              <span className="hint-text">Scroll to Explore</span>
              <span className="arrow-down">↓</span>
            </button>

            {/* 2. Skip Chapter Button */}
            <button 
              onClick={() => handleScrollToSection('about-us')} 
              className="skip-btn"
            >
              Skip
            </button>
          </>
        )}
      </div>

      <style jsx global>{`
        .cinematic-container {
          position: relative;
          width: 100%;
          background: #000;
        }

        .cinematic-viewport {
          position: sticky;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #000;
        }

        .cinematic-video {
          opacity: 0; /* Managed by VideoEngine */
        }

        .cinematic-loader {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          z-index: 10;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 255, 255, 0.08);
          border-top-color: rgba(255, 255, 255, 0.85);
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Global premium navigation style */
        .global-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2.5rem 3.5rem;
          z-index: 90;
          pointer-events: auto;
          box-sizing: border-box;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .nav-brand {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: color 0.3s ease;
          position: relative;
        }

        .nav-item:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .nav-item .active-dot {
          display: none;
          color: #d4af37; /* Gold indicator dot */
        }

        .nav-item.active {
          color: #ffffff;
        }

        .nav-item.active .dot {
          display: none;
        }

        .nav-item.active .active-dot {
          display: inline;
        }

        /* Floating Chapter 1 UI Controls */
        /* Floating Chapter 1 UI Controls */
        .explore-btn {
          position: absolute;
          bottom: 3.5rem;
          left: 50%;
          transform: translate(-50%, 0) scale(1);
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
          background: rgba(15, 15, 15, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(212, 175, 55, 0.4);
          padding: 0.75rem 1.8rem;
          border-radius: 30px;
          color: #ffffff;
          font-family: system-ui, sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          z-index: 95;
          cursor: pointer;
          pointer-events: auto;
          opacity: 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(212, 175, 55, 0.1);
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                      background-color 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                      border-color 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                      box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1);
          animation: fadeIn 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards, pulseGlow 2.5s ease-in-out infinite 1.2s;
        }

        .explore-btn:hover {
          background: rgba(15, 15, 15, 0.65);
          border-color: rgba(212, 175, 55, 0.8);
          transform: translate(-50%, 0) scale(1.03);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.65), 0 0 15px rgba(212, 175, 55, 0.3);
        }

        .explore-btn .arrow-down {
          font-size: 1rem;
          display: inline-block;
          animation: bounce 2s infinite;
        }

        .skip-btn {
          position: fixed;
          top: 7.2rem;
          right: 3.5rem;
          transform: scale(1);
          background: rgba(15, 15, 15, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #ffffff;
          padding: 0.6rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: system-ui, sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          z-index: 95;
          pointer-events: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(212, 175, 55, 0.1);
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                      background-color 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                      border-color 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                      box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .skip-btn:hover {
          background: rgba(15, 15, 15, 0.65);
          border-color: rgba(212, 175, 55, 0.8);
          transform: scale(1.03);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.65), 0 0 15px rgba(212, 175, 55, 0.3);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, 15px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(212, 175, 55, 0.1), 0 4px 20px rgba(0, 0, 0, 0.5);
            border-color: rgba(212, 175, 55, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.25), 0 4px 25px rgba(0, 0, 0, 0.6);
            border-color: rgba(212, 175, 55, 0.65);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
          60% {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
};
