import { Chapter, EngineState } from './types';
import { VideoEngine } from './VideoEngine';

export class SceneManager {
  private chapters: Chapter[];
  private videoEngine: VideoEngine;
  private onStateChange: (state: EngineState) => void;

  private currentChapter: Chapter | null = null;
  private currentChapterIndex = -1;
  private globalProgress = 0;
  private localProgress = 0;
  private scrollDirection = 0;
  private isPreloading = false;
  private isOutsideCinematic = false;

  constructor(
    chapters: Chapter[],
    videoEngine: VideoEngine,
    onStateChange: (state: EngineState) => void
  ) {
    this.chapters = chapters;
    this.videoEngine = videoEngine;
    this.onStateChange = onStateChange;

    // Load initial chapter
    if (this.chapters.length > 0) {
      this.currentChapterIndex = 0;
      this.currentChapter = this.chapters[0];
      // Load the first video directly into the active player
      this.videoEngine.getActiveVideo().src = this.currentChapter.videoSrc;
      this.videoEngine.getActiveVideo().load();

      // Preload the second video
      if (this.chapters.length > 1) {
        this.videoEngine.preloadSource(this.chapters[1].videoSrc);
      }
    }
  }

  /**
   * Called by the ScrollEngine when the scroll progress changes.
   */
  public handleScrollUpdate(progress: number, direction: number) {
    this.globalProgress = progress;
    this.scrollDirection = direction;

    // Detect if we scrolled completely past the cinematic engine into subsequent pages
    if (progress >= 1.0) {
      if (!this.isOutsideCinematic) {
        this.isOutsideCinematic = true;
      }
      this.dispatchState();
      return;
    }

    // If we scrolled back up into the cinematic experience
    if (this.isOutsideCinematic && progress < 1.0) {
      this.isOutsideCinematic = false;
    }

    // 1. Identify which chapter we are currently scrolling through
    const index = this.findChapterIndexForProgress(progress);
    if (index === -1) return;

    const chapter = this.chapters[index];
    const isChapterChanged = index !== this.currentChapterIndex;

    this.currentChapter = chapter;
    this.currentChapterIndex = index;

    // 2. Calculate local progress within this chapter
    const progressRange = chapter.endProgress - chapter.startProgress;
    const progressOffset = progress - chapter.startProgress;
    this.localProgress = progressRange > 0 
      ? Math.max(0, Math.min(1, progressOffset / progressRange))
      : 0;

    // 3. Estimate target time in active video
    const video = this.videoEngine.getActiveVideo();
    const duration = video.duration || 0;
    const targetTime = this.localProgress * duration;

    // 4. Update the VideoEngine
    if (isChapterChanged) {
      // Transition to new source, specifying the start time (0 if scrolling down, duration if scrolling up)
      const isScrollingDown = direction >= 0;
      const initialTime = isScrollingDown ? 0 : duration;
      this.videoEngine.transitionToSource(chapter.videoSrc, initialTime);
    } else {
      // Just seek within active video
      this.videoEngine.setTargetTime(targetTime);
    }

    // 5. Proactive Preloading: look ahead or behind based on direction
    this.triggerProactivePreload(index, direction);

    // 6. Notify state changes
    this.dispatchState();
  }

  private findChapterIndexForProgress(progress: number): number {
    for (let i = 0; i < this.chapters.length; i++) {
      const chapter = this.chapters[i];
      if (progress >= chapter.startProgress && progress <= chapter.endProgress) {
        return i;
      }
    }
    if (progress <= 0) return 0;
    if (progress >= 1) return this.chapters.length - 1;
    return -1;
  }

  private triggerProactivePreload(currentIndex: number, direction: number) {
    this.isPreloading = false;
    let preloadIndex = -1;

    if (direction >= 0) {
      if (currentIndex + 1 < this.chapters.length) {
        preloadIndex = currentIndex + 1;
      }
    } else {
      if (currentIndex - 1 >= 0) {
        preloadIndex = currentIndex - 1;
      }
    }

    if (preloadIndex !== -1) {
      this.isPreloading = true;
      const preloadChapter = this.chapters[preloadIndex];
      this.videoEngine.preloadSource(preloadChapter.videoSrc);
    }
  }

  private dispatchState() {
    this.onStateChange({
      globalProgress: this.globalProgress,
      activeChapterId: this.currentChapter ? this.currentChapter.id : null,
      localProgress: this.localProgress,
      scrollDirection: this.scrollDirection,
      isPreloading: this.isPreloading,
    });
  }
}
