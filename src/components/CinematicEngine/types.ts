export interface Chapter {
  id: string;
  title: string;
  videoSrc: string;
  audioSrc?: string; // Optional environment audio loop for this chapter
  audioVolume?: number; // Optional volume for this chapter's audio
  startProgress: number; // 0 to 1, start scroll point
  endProgress: number;   // 0 to 1, end scroll point
}

export interface EngineConfig {
  chapters: Chapter[];
  containerSelector: string; // The pin container
}

export interface EngineState {
  globalProgress: number; // 0 to 1
  activeChapterId: string | null;
  localProgress: number;  // 0 to 1 (within current chapter)
  scrollDirection: number; // 1 for down, -1 for up, 0 for idle
  isPreloading: boolean;
}

export interface IntroConfig {
  svgPath: string; // URL of the SVG file, e.g. '/assets/karnataka-outline.svg'
  audioPath: string; // URL of the intro audio track, e.g. '/audio/intro.mp3'
  audioVolume: number; // Volume value between 0 and 1
  ambientOnlyDuration: number; // Seconds before drawing starts (Scene 1)
  drawDuration: number; // Seconds spent drawing paths (Scene 2)
  glowDuration: number; // Seconds spent in static glowing phase (Scene 3)
  pauseDuration: number; // Seconds spent paused after drawing completes before transition
  transitionDuration: number; // Seconds spent scaling up and fading out (Scene 4)
  strokeColor: string; // Color of the stroke, e.g., '#d4af37'
  strokeWidth: number; // Thickness of the outline stroke
  glowColor: string; // Glow color, e.g., 'rgba(212, 175, 55, 0.5)'
  glowIntensity: number; // Glow filter radius (px)
  maxAmbientParticles: number; // Maximum particles in background
  ambientParticleSpeed: number; // Speed multiplier for drift
  particleColors: string[]; // Colors for golden dust
  minParticleSize: number; // Min particle diameter (px)
  maxParticleSize: number; // Max particle diameter (px)
  trailDensity: number; // Amount of trail particles emitted per frame
  zoomScale: number; // Enlargement factor in Scene 4
  canvasOpacity: number; // Canvas ambient opacity
}

export type StateChangeCallback = (state: EngineState) => void;
