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
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  // Class to add when element is revealed
  readonly revealClass = input('is-visible', { alias: 'appScrollReveal' });

  // How much of the element must be visible before triggering (0 - 1)
  readonly threshold = input(0.1);

  // Only trigger once, then stop observing
  readonly once = input(true);

  private observer?: IntersectionObserver;
  private navigationSubscription?: Subscription;

  ngOnInit(): void {
    // Guard for SSR - IntersectionObserver doesn't exist on the server
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const element = this.el.nativeElement;

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersect(entries),
      {
        root: null, // viewport
        threshold: this.threshold(),
        rootMargin: '0px 0px -10% 0px', // trigger slightly before it fully hits bottom
      }
    );

    this.observer.observe(element);
    requestAnimationFrame(() => this.checkVisibility(element));

    this.navigationSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        requestAnimationFrame(() => this.checkVisibility(element));
      });
  }

  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const intersection = {
      top: Math.max(0, rect.top),
      left: Math.max(0, rect.left),
      bottom: Math.min(window.innerHeight, rect.bottom),
      right: Math.min(window.innerWidth, rect.right),
    };

    const width = Math.max(0, intersection.right - intersection.left);
    const height = Math.max(0, intersection.bottom - intersection.top);
    const visibleArea = width * height;
    const totalArea = rect.width * rect.height;

    if (totalArea === 0) {
      return false;
    }

    return visibleArea / totalArea >= this.threshold();
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

  private checkVisibility(element: HTMLElement): void {
    if (this.isElementVisible(element)) {
      this.renderer.addClass(element, this.revealClass());
      if (this.once()) {
        this.observer?.unobserve(element);
      }
    } else if (!this.once()) {
      this.renderer.removeClass(element, this.revealClass());
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.navigationSubscription?.unsubscribe();
  }
}
