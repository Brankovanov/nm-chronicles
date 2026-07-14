import {
  Directive,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  input,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);

  // Class to add when element is revealed
  readonly revealClass = input('is-visible', { alias: 'appScrollReveal' });

  // How much of the element must be visible before triggering (0 - 1)
  readonly threshold = input(0.1);

  // Only trigger once, then stop observing
  readonly once = input(true);

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    // Guard for SSR - IntersectionObserver doesn't exist on the server
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersect(entries),
      {
        root: null, // viewport
        threshold: this.threshold(),
        rootMargin: '0px 0px -10% 0px', // trigger slightly before it fully hits bottom
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  private handleIntersect(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.renderer.addClass(this.el.nativeElement, this.revealClass());

        if (this.once()) {
          this.observer?.unobserve(entry.target);
        }
      } else if (!this.once()) {
        this.renderer.removeClass(this.el.nativeElement, this.revealClass());
      }
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
