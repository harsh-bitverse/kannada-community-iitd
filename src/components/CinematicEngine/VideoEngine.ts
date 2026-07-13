export class VideoEngine {
  private videoA: HTMLVideoElement;
  private videoB: HTMLVideoElement;
  private activeVideo: HTMLVideoElement;
  private bufferVideo: HTMLVideoElement;

  private targetTime = 0;
  private pendingTime: number | null = null;
  private isUpdating = false;
  private lerpFactor = 0.15; // Smoothness factor (0.1 - 0.2 is ideal)

  constructor(videoA: HTMLVideoElement, videoB: HTMLVideoElement) {
    this.videoA = videoA;
    this.videoB = videoB;

    this.activeVideo = videoA;
    this.bufferVideo = videoB;

    this.setupVideoProperties(this.videoA);
    this.setupVideoProperties(this.videoB);

    this.videoA.style.opacity = '1';
    this.videoB.style.opacity = '0';

    // Register seeked event listeners for seek-guard backpressure control
    this.videoA.addEventListener('seeked', this.onSeeked);
    this.videoB.addEventListener('seeked', this.onSeeked);
  }

  private setupVideoProperties(video: HTMLVideoElement) {
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.controls = false;
    video.style.position = 'absolute';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.pointerEvents = 'none';
    video.style.transition = 'opacity 0.6s ease-in-out';
  }

  public getActiveVideo(): HTMLVideoElement {
    return this.activeVideo;
  }

  public getBufferVideo(): HTMLVideoElement {
    return this.bufferVideo;
  }

  /**
   * Preload a video source in the buffer video element.
   */
  public preloadSource(src: string) {
    const resolved = this.resolveUrl(src);
    if (this.bufferVideo.src !== resolved && this.activeVideo.src !== resolved) {
      this.bufferVideo.src = src;
      this.bufferVideo.load();
    }
  }

  /**
   * Smoothly scrubs the active video to the target local time.
   * Utilizes a seek-guard backpressure mechanism to prevent frame-seek queue pile-ups.
   */
  public setTargetTime(time: number) {
    const duration = this.activeVideo.duration;
    if (isNaN(duration) || duration === 0) return;

    this.targetTime = Math.max(0, Math.min(time, duration));

    // If the browser is currently seeking, queue the target and return.
    // The seeked event will resume updates once the current frame is rendered.
    if (this.activeVideo.seeking) {
      this.pendingTime = this.targetTime;
      return;
    }

    if (!this.isUpdating) {
      this.isUpdating = true;
      this.tick();
    }
  }

  /**
   * The animation tick loop for lerping video currentTime.
   */
  private tick = () => {
    if (!this.isUpdating) return;

    const video = this.activeVideo;

    // Pause update loops if the video starts seeking. Let the seeked event resume it.
    if (video.seeking) {
      this.isUpdating = false;
      return;
    }

    const diff = this.targetTime - video.currentTime;

    // Close enough, snap to target and finish updating
    if (Math.abs(diff) < 0.01) {
      video.currentTime = this.targetTime;
      this.isUpdating = false;
      return;
    }

    // Apply smooth interpolation (lerping)
    video.currentTime += diff * this.lerpFactor;

    requestAnimationFrame(this.tick);
  };

  /**
   * Handler for seeked event. Implements backpressure queue consumption.
   */
  private onSeeked = (e: Event) => {
    const video = e.target as HTMLVideoElement;
    if (video === this.activeVideo && this.pendingTime !== null) {
      const nextTime = this.pendingTime;
      this.pendingTime = null;
      this.setTargetTime(nextTime);
    }
  };

  /**
   * Seamlessly transitions the active source to the new source.
   */
  public transitionToSource(src: string, targetTime: number) {
    const resolvedSrc = this.resolveUrl(src);

    if (this.activeVideo.src === resolvedSrc) {
      this.setTargetTime(targetTime);
      return;
    }

    if (this.bufferVideo.src === resolvedSrc) {
      this.swapVideos(targetTime);
    } else {
      // Fallback load
      this.bufferVideo.src = src;
      this.bufferVideo.load();

      const onCanPlay = () => {
        this.swapVideos(targetTime);
        this.bufferVideo.removeEventListener('canplay', onCanPlay);
      };
      this.bufferVideo.addEventListener('canplay', onCanPlay);
    }
  }

  private swapVideos(startTime: number) {
    this.bufferVideo.currentTime = startTime;
    this.targetTime = startTime;
    this.pendingTime = null;

    // Crossfade opacity
    this.activeVideo.style.opacity = '0';
    this.bufferVideo.style.opacity = '1';

    // Swap references
    const temp = this.activeVideo;
    this.activeVideo = this.bufferVideo;
    this.bufferVideo = temp;

    this.isUpdating = true;
    this.tick();
  }

  private resolveUrl(url: string): string {
    if (typeof window === 'undefined') return url;
    const a = document.createElement('a');
    a.href = url;
    return a.href;
  }

  public destroy() {
    this.isUpdating = false;
    this.pendingTime = null;

    this.videoA.removeEventListener('seeked', this.onSeeked);
    this.videoB.removeEventListener('seeked', this.onSeeked);

    this.videoA.src = '';
    this.videoB.src = '';
    this.videoA.load();
    this.videoB.load();
  }
}
