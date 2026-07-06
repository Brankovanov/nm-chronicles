import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ViewMode = 'desktop' | 'mobile';

@Injectable({
  providedIn: 'root'
})
export class ViewChangeService {
  private readonly isBrowser = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  private readonly mediaQuery = this.isBrowser ? window.matchMedia('(min-width: 901px)') : null;
  private readonly viewModeSubject = new BehaviorSubject<ViewMode>(this.getInitialViewMode());

  readonly viewMode$ = this.viewModeSubject.asObservable();
  readonly isDesktop = signal(this.viewModeSubject.value === 'desktop');
  readonly isMobile = computed(() => !this.isDesktop());

  constructor() {
    if (this.mediaQuery) {
      const listener = (event: MediaQueryListEvent) => this.onMediaQueryChange(event.matches);

      if (typeof this.mediaQuery.addEventListener === 'function') {
        this.mediaQuery.addEventListener('change', listener);
      } else {
        this.mediaQuery.addListener(listener);
      }
    }
  }

  private getInitialViewMode(): ViewMode {
    return this.isBrowser && this.mediaQuery?.matches ? 'desktop' : 'mobile';
  }

  private onMediaQueryChange(isDesktop: boolean): void {
    const nextMode: ViewMode = isDesktop ? 'desktop' : 'mobile';
    this.isDesktop.set(isDesktop);
    this.viewModeSubject.next(nextMode);
  }
}
