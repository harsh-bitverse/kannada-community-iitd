import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export class ScrollEngine {
  private container: HTMLElement;
  private scrollTriggerInstance: ScrollTrigger | null = null;
  private onUpdateCallback: (progress: number, direction: number) => void;

  constructor(
    container: HTMLElement,
    chaptersCount: number,
    onUpdate: (progress: number, direction: number) => void
  ) {
    this.container = container;
    this.onUpdateCallback = onUpdate;
    this.init(chaptersCount);
  }

  private init(chaptersCount: number) {
    // Allocate 600vh of scroll distance per chapter for immersive, slower scrubbing
    const scrollMultiplier = chaptersCount * 6;
    const endValue = `+=${scrollMultiplier * 100}%`;

    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: this.container,
      start: 'top top',
      end: endValue,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        // self.progress is a value between 0 and 1
        // self.direction is 1 (down) or -1 (up)
        this.onUpdateCallback(self.progress, self.direction);
      },
    });
  }

  public refresh() {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.refresh();
    }
  }

  public destroy() {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill(true);
      this.scrollTriggerInstance = null;
    }
  }
}
