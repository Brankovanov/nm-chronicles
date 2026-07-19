import { Injectable } from '@angular/core';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export interface AnalyticsConfig {
  googleAnalyticsId: string;
  clarityId?: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private initialized = false;
  private googleAnalyticsId: string | null = null;
  private clarityId: string | null = null;

  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    const config = await this.loadConfig();
    if (!config?.googleAnalyticsId) {
      return;
    }

    this.googleAnalyticsId = config.googleAnalyticsId;
    this.clarityId = config.clarityId || null;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer?.push(arguments);
    };

    const existingGtagScript = document.querySelector(
      `script[src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.googleAnalyticsId)}"]`
    );

    if (!existingGtagScript) {
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.googleAnalyticsId)}`;
      document.head.appendChild(gtagScript);
    }

    window.gtag('js', new Date());
    window.gtag('config', config.googleAnalyticsId, { send_page_view: false });

    if (this.clarityId) {
      this.insertClarityScript(this.clarityId);
    }

    this.initialized = true;
  }

  shutdown(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.googleAnalyticsId) {
      (window as unknown as Record<string, unknown>)[`ga-disable-${this.googleAnalyticsId}`] = true;
    }

    const scriptUrl = this.googleAnalyticsId
      ? `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.googleAnalyticsId)}`
      : null;

    if (scriptUrl) {
      const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
      existingScript?.remove();
    }

    if (typeof window.gtag === 'function') {
      delete window.gtag;
    }

    if (window.dataLayer) {
      window.dataLayer = [];
    }

    if (this.clarityId) {
      const clarityScript = document.querySelector(`script[src="https://www.clarity.ms/tag/${encodeURIComponent(this.clarityId)}"]`);
      clarityScript?.remove();
      const clarityInterface = (window as unknown as Record<string, unknown>)['clarity'];
      if (typeof clarityInterface !== 'undefined') {
        delete (window as unknown as Record<string, unknown>)['clarity'];
      }
    }

    this.initialized = false;
    this.googleAnalyticsId = null;
    this.clarityId = null;
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

  private insertClarityScript(clarityId: string): void {
    const existingScript = document.querySelector(`script[src="https://www.clarity.ms/tag/${encodeURIComponent(clarityId)}"]`);
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.text = `
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/${encodeURIComponent(clarityId)}";
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${encodeURIComponent(clarityId)}");
    `;
    document.head.appendChild(script);
  }

  private async loadConfig(): Promise<AnalyticsConfig | null> {
    try {
      const baseHref = document.querySelector('base')?.getAttribute('href') ?? '/';
      const baseUrl = `${window.location.origin}${baseHref}`;
      const url = new URL('analytics-config.json', baseUrl).toString();
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return {
        googleAnalyticsId: typeof data.googleAnalyticsId === 'string' ? data.googleAnalyticsId : '',
        clarityId: typeof data.clarityId === 'string' ? data.clarityId : undefined,
      };
    } catch {
      return null;
    }
  }
}
