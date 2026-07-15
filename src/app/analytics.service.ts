import { Injectable } from '@angular/core';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export interface AnalyticsConfig {
  googleAnalyticsId: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    const config = await this.loadConfig();
    if (!config?.googleAnalyticsId) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer?.push(arguments);
    };

    const existingScript = document.querySelector(
      `script[src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.googleAnalyticsId)}"]`
    );

    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.googleAnalyticsId)}`;
      document.head.appendChild(script);
    }

    window.gtag('js', new Date());
    window.gtag('config', config.googleAnalyticsId, { send_page_view: false });
    this.initialized = true;
  }

  sendPageView(url: string, title: string): void {
    if (typeof window === 'undefined' || !this.initialized || typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: title,
    });
  }

  private async loadConfig(): Promise<AnalyticsConfig | null> {
    try {
      const base = document.querySelector('base')?.getAttribute('href') ?? '/';
      const url = new URL('analytics-config.json', base).toString();
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return {
        googleAnalyticsId: typeof data.googleAnalyticsId === 'string' ? data.googleAnalyticsId : '',
      };
    } catch {
      return null;
    }
  }
}
