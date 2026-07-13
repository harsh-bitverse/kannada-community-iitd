'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { IntroConfig } from './types';


// standalone requestAnimationFrame volume fader for cinematic audio transitions
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
    // Cubic ease-in-out volume transition
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
interface IntroOverlayProps {
  config?: Partial<IntroConfig>;
  onComplete: () => void;
}

const DEFAULT_CONFIG: IntroConfig = {
  svgPath: '/assets/karnataka-outline.svg',
  audioPath: '/audio/intro.mp3',
  audioVolume: 0.8,
  ambientOnlyDuration: 0, // Instant drawing, no initial ambient-only delay
  drawDuration: 7.0, // 0.0s -> 7.0s: Draw Karnataka outline
  glowDuration: 0.2, // 7.0s -> 7.2s: Restrained glow bloom
  pauseDuration: 0.0, // Integrated directly into glow phase for exact 8s timing
  transitionDuration: 0.8, // 7.2s -> 8.0s: Smooth zoom camera travel transition
  strokeColor: '#d4af37', // Warm antique gold
  strokeWidth: 2,
  glowColor: 'rgba(212, 175, 55, 0.35)', // Elegant bloom
  glowIntensity: 8,
  maxAmbientParticles: 20, // Low particle count for high-quality floating gold dust
  ambientParticleSpeed: 0.2,
  particleColors: ['#d4af37', '#f3e5ab', '#ffdf7a', '#c5a059'],
  minParticleSize: 0.4,
  maxParticleSize: 1.4,
  trailDensity: 1, // Finer gold dust trail from drawing tip
  zoomScale: 10.0, // Cinematic zoom travel factor
  canvasOpacity: 1.0, // Mask underlying cinematic fully
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  isTrail: boolean;
  active: boolean;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({
  config: userConfig,
  onComplete,
}) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<SVGPathElement[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [svgData, setSvgData] = useState<{ viewBox: string; paths: string[] } | null>(null);
  const [pathsMeasured, setPathsMeasured] = useState(false);
  const [audioEventLoaded, setAudioEventLoaded] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const audioLoaded = audioEventLoaded || (audioElement ? audioElement.readyState >= 3 : false);
  const isReady = pathsMeasured && audioLoaded;

  const handleSkip = () => {
    if (overlayRef.current) {
      // Prevent double triggers
      overlayRef.current.style.pointerEvents = 'none';

      // 1. Gently fade out the audio over 0.4s
      if (audioRef.current) {
        fadeAudio(audioRef.current, 0, 0.4);
      }

      // 2. Gently fade out the overlay over 0.4s using GSAP
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => {
          // 3. Immediately stop timeline, clear resources and hand off to parent
          if (timelineRef.current) {
            timelineRef.current.kill();
          }
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
          }
          onComplete();
        }
      });
    } else {
      // Fallback
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      onComplete();
    }
  };

  // 1. Preload audio asset and handle ready states
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio(config.audioPath);
    audio.volume = 0; // Start at 0 for fade-in
    audio.loop = false; // Do not loop the audio
    audio.preload = 'auto';
    audioRef.current = audio;

    // Use setTimeout 0 to set the state asynchronously, avoiding synchronous render-update warnings
    const timerId = setTimeout(() => {
      setAudioElement(audio);
    }, 0);

    const handleAudioCanPlay = () => {
      setAudioEventLoaded(true);
    };

    if (audio.readyState < 3) {
      audio.addEventListener('canplaythrough', handleAudioCanPlay);
    }

    // Timeout fallback (2.5s) to guarantee loading continues if network drops or file is missing
    const fallbackId = setTimeout(() => {
      setAudioEventLoaded(true);
    }, 2500);

    return () => {
      clearTimeout(timerId);
      clearTimeout(fallbackId);
      audio.removeEventListener('canplaythrough', handleAudioCanPlay);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [config.audioPath]);



  // 2. Fetch and parse SVG outline dynamically
  useEffect(() => {
    let active = true;

    async function fetchAndParseSVG() {
      try {
        const response = await fetch(config.svgPath);
        if (!response.ok) {
          throw new Error(`Failed to load SVG outline asset from ${config.svgPath}`);
        }
        const text = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (!svgEl) {
          throw new Error('Invalid SVG asset: root node <svg> is missing.');
        }

        const viewBox = svgEl.getAttribute('viewBox') || '0 0 800 600';
        const pathNodes = doc.querySelectorAll('path');
        const paths: string[] = [];

        pathNodes.forEach((node) => {
          const d = node.getAttribute('d');
          if (d) paths.push(d);
        });

        if (paths.length === 0) {
          throw new Error('Invalid SVG asset: no <path> nodes found.');
        }

        if (active) {
          setSvgData({ viewBox, paths });
        }
      } catch (err: unknown) {
        if (active) {
          console.warn(`IntroOverlay Warning: Falling back. Details:`, err);
          onComplete(); // Skip immediately
        }
      }
    }

    fetchAndParseSVG();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.svgPath]);

  // 3. Set pathsMeasured once path DOM refs are registered
  useEffect(() => {
    if (!svgData) return;
    const paths = pathRefs.current.filter(Boolean);
    if (paths.length > 0) {
      setPathsMeasured(true);
    }
  }, [svgData]);



  // 5. Orchestrate and synchronize canvas loop, timeline, and audio playback in frame-sync
  useEffect(() => {
    if (!isReady || !svgData) return;

    const paths = pathRefs.current.filter(Boolean);
    if (paths.length === 0) return;

    // Calculate dynamic stroke lengths
    const lengths = paths.map((path) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      return len;
    });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle Object Pool
    const MAX_PARTICLES = 250;
    const particlePool: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      alpha: 0,
      decay: 0,
      color: '',
      isTrail: false,
      active: false,
    }));

    const hexToRgba = (hex: string, alpha: number): string => {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const spawnParticle = (x: number, y: number, isTrail: boolean) => {
      const p = particlePool.find((item) => !item.active);
      if (!p) return;

      p.active = true;
      p.x = x;
      p.y = y;
      p.isTrail = isTrail;
      p.color = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];

      if (isTrail) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.6 + 0.1;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed + 0.04;
        p.size = Math.random() * (config.maxParticleSize - config.minParticleSize) + config.minParticleSize;
        p.alpha = Math.random() * 0.45 + 0.25;
        p.decay = Math.random() * 0.02 + 0.01;
      } else {
        p.vx = (Math.random() - 0.5) * config.ambientParticleSpeed;
        p.vy = (Math.random() - 0.5) * config.ambientParticleSpeed - 0.012;
        p.size = Math.random() * (config.maxParticleSize - config.minParticleSize) + config.minParticleSize;
        p.alpha = Math.random() * 0.25 + 0.05;
        p.decay = Math.random() * 0.0025 + 0.0004;
      }
    };

    let animationFrameId: number;
    let frameTime = 0;

    const renderLoop = () => {
      frameTime++;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Ambient particle generation
      const activeAmbient = particlePool.filter((p) => p.active && !p.isTrail).length;
      if (activeAmbient < config.maxAmbientParticles && Math.random() < 0.1) {
        spawnParticle(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight + 20,
          false
        );
      }

      particlePool.forEach((p) => {
        if (!p.active) return;

        if (!p.isTrail) {
          p.vx += Math.sin(frameTime * 0.015 + p.x * 0.008) * 0.0008;
          p.vy += Math.cos(frameTime * 0.015 + p.y * 0.008) * 0.0004;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.x < 0 || p.x > window.innerWidth || p.y < 0 || p.y > window.innerHeight) {
          p.active = false;
          return;
        }

        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, hexToRgba(p.color, p.alpha));
        grad.addColorStop(1, hexToRgba(p.color, 0));
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    // 6. Timeline Orchestration
    const animProxy = { progress: 0 };
    let cancelActiveFade: (() => void) | null = null;

    const timeline = gsap.timeline({
      onComplete: () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationFrameId);
        if (cancelActiveFade) cancelActiveFade();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }
        timeline.kill();
        onComplete();
      },
    });
    timelineRef.current = timeline;

    // FIRST VISIBLE FRAME: Instant outline reveal at progress 0, begin drawing stroke immediately
    timeline.set(svgWrapperRef.current, { opacity: 1 });

    // Scene 2: Drawing the Karnataka outline (0.0s -> 7.0s)
    timeline.to(animProxy, {
      progress: 1,
      duration: config.drawDuration,
      ease: 'power2.inOut', // Slower on path boundaries/curves
      onUpdate: () => {
        const globalP = animProxy.progress;
        const numPaths = paths.length;
        const step = 1 / numPaths;

        const activeIdx = Math.min(numPaths - 1, Math.floor(globalP / step));
        const localP = (globalP - activeIdx * step) / step;

        paths.forEach((path, idx) => {
          const len = lengths[idx];
          if (idx < activeIdx) {
            path.style.strokeDashoffset = '0';
          } else if (idx > activeIdx) {
            path.style.strokeDashoffset = `${len}`;
          } else {
            path.style.strokeDashoffset = `${(1 - localP) * len}`;

            // Emit drawing trails
            try {
              const svgPoint = path.getPointAtLength(localP * len);
              const svgEl = path.ownerSVGElement;
              if (svgEl) {
                const pt = svgEl.createSVGPoint();
                pt.x = svgPoint.x;
                pt.y = svgPoint.y;
                const screenPt = pt.matrixTransform(path.getScreenCTM()!);

                for (let i = 0; i < config.trailDensity; i++) {
                  spawnParticle(screenPt.x, screenPt.y, true);
                }
              }
            } catch {
              // Fail-safe wrapper
            }
          }
        });
      },
    });

    // Scene 3: Atmospheric glow bloom pause (7.0s -> 7.2s)
    timeline.to(svgWrapperRef.current, {
      filter: `drop-shadow(0 0 ${config.glowIntensity}px ${config.glowColor})`,
      duration: config.glowDuration,
      ease: 'power2.out',
    });

    // Scene 4: Camera Zoom Travel Transition (7.2s -> 8.0s)
    timeline.to(svgWrapperRef.current, {
      scale: config.zoomScale,
      opacity: 0,
      duration: config.transitionDuration,
      ease: 'power2.in',
    }, `>-0.1`);

    timeline.to(overlayRef.current, {
      opacity: 0,
      duration: config.transitionDuration,
      ease: 'power2.inOut',
    }, '<');

    // Trigger audio fade-out 800ms before timeline ends (independent of GSAP)
    timeline.call(() => {
      if (audioRef.current) {
        if (cancelActiveFade) cancelActiveFade();
        cancelActiveFade = fadeAudio(audioRef.current, 0, config.transitionDuration);
      }
    }, [], '<');

    // 7. Autoplay & Interaction Guard: play audio instantly with drawing start
    const playAudioInSync = () => {
      if (!audioRef.current || !timelineRef.current) return;
      const elapsed = timelineRef.current.time();
      if (elapsed >= 8.0) return; // Do not restart if timeline completes

      audioRef.current.currentTime = elapsed;
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        if (audioRef.current) {
          if (cancelActiveFade) cancelActiveFade();
          cancelActiveFade = fadeAudio(audioRef.current, config.audioVolume, 0.7);
        }
      }).catch(() => {});
    };

    const playOnInteraction = () => {
      playAudioInSync();
      document.removeEventListener('click', playOnInteraction);
      document.removeEventListener('touchstart', playOnInteraction);
      document.removeEventListener('scroll', playOnInteraction);
    };

    if (audioRef.current) {
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        if (audioRef.current) {
          if (cancelActiveFade) cancelActiveFade();
          cancelActiveFade = fadeAudio(audioRef.current, config.audioVolume, 0.7);
        }
      }).catch((err) => {
        console.warn('Autoplay blocked. Registering interaction listeners for dynamic seeking audio sync.', err);
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
        document.addEventListener('scroll', playOnInteraction);
      });
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('click', playOnInteraction);
      document.removeEventListener('touchstart', playOnInteraction);
      document.removeEventListener('scroll', playOnInteraction);
      if (cancelActiveFade) cancelActiveFade();
      timeline.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, svgData]);

  return (
    <div 
      ref={overlayRef} 
      className={`intro-overlay ${isReady ? 'ready' : ''}`} 
      style={{ opacity: isReady ? config.canvasOpacity : 0 }}
    >
      <canvas ref={canvasRef} className="intro-canvas" />

      {/* Skip Intro Button */}
      {isReady && (
        <button 
          className="skip-intro-btn" 
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          aria-label="Skip Intro"
        >
          Skip Intro →
        </button>
      )}

      <div className="svg-container">
        <div ref={svgWrapperRef} className="svg-wrapper">
          {svgData && (
            <svg
              viewBox={svgData.viewBox}
              className="intro-svg"
            >
              {svgData.paths.map((d, index) => (
                <path
                  key={index}
                  ref={(el) => {
                    if (el) pathRefs.current[index] = el;
                  }}
                  d={d}
                  stroke={config.strokeColor}
                  strokeWidth={config.strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>
          )}
        </div>
      </div>

      <style jsx global>{`
        .intro-overlay {
          position: fixed;
          inset: 0;
          background: #000000;
          z-index: 100;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          opacity: 0;
          transition: opacity 0.4s ease-in-out;
        }

        .intro-overlay.ready {
          opacity: 1;
        }

        .intro-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .svg-container {
          position: relative;
          width: 75vw;
          height: 75vh;
          max-width: 700px;
          max-height: 550px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .svg-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform-origin: center center;
          will-change: transform, opacity;
        }

        .intro-svg {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
        }

        .skip-intro-btn {
          position: fixed;
          top: 3.5rem;
          right: 3.5rem;
          padding: 0.6rem 1.4rem;
          background: rgba(15, 15, 15, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(212, 175, 55, 0.3);
          border-radius: 30px;
          color: #ffffff;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          z-index: 105;
          pointer-events: auto; /* Allow click interactions */
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), 0 0 10px rgba(212, 175, 55, 0.05);
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      background-color 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      border-color 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .skip-intro-btn:hover {
          transform: scale(1.03);
          background: rgba(15, 15, 15, 0.6);
          border-color: rgba(212, 175, 55, 0.75);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45), 0 0 15px rgba(212, 175, 55, 0.2);
        }

        .skip-intro-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};
