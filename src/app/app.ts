import { Component, effect, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { LightHouse } from './layout/shared-components/light-house/light-house';
import { Loader } from './layout/shared-components/loader/loader';
import { CookieConsent } from './layout/shared-components/cookie-consent/cookie-consent';
import { LoaderService } from './services/loader.service';
import { CookieConsentService } from './services/cookie-consent.service';
import { AnalyticsService } from './analytics.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, LightHouse, Loader, CookieConsent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  private readonly router = inject(Router);
  private readonly loaderService = inject(LoaderService);
  private readonly consentService = inject(CookieConsentService);
  private readonly analyticsService = inject(AnalyticsService);

  readonly loading = this.loaderService.active;
  readonly loadingMessage = this.loaderService.message;
  readonly analyticsAllowed = this.consentService.analyticsAllowed;
  protected readonly title = signal('nm-chronicles');

  constructor() {
    if (typeof document !== 'undefined') {
      effect(() => {
        document.body.classList.toggle('loader-active', this.loading());
      });

      effect(() => {
        if (!this.analyticsAllowed()) {
          return;
        }

        const globalWindow = window as Window & {
          requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => void;
        };

        if (typeof globalWindow.requestIdleCallback === 'function') {
          globalWindow.requestIdleCallback(() => void this.analyticsService.init(), { timeout: 3000 });
        } else {
          globalWindow.addEventListener('load', () => void this.analyticsService.init(), { once: true, passive: true });
          setTimeout(() => void this.analyticsService.init(), 3000);
        }
      });
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loaderService.show('Loading page…');
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loaderService.hide();
      }

      if (event instanceof NavigationEnd) {
        this.sendPageView(event.urlAfterRedirects);
      }
    });
  }

  private sendPageView(url: string): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}