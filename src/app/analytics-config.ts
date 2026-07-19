import { InjectionToken, inject } from '@angular/core';

export interface AnalyticsConfig {
  googleAnalyticsId: string;
  cloudflareGoogleAnalyticsId?: string;
  clarityId?: string;
}

export const ANALYTICS_CONFIG = new InjectionToken<AnalyticsConfig>('ANALYTICS_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    googleAnalyticsId: 'G-XXXXXXXXXX',
    cloudflareGoogleAnalyticsId: undefined,
    clarityId: undefined,
  }),
});

function isCloudflareEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const host = window.location.host;
  return host.endsWith('newportmaeve.com');
}

export async function loadAnalyticsConfig(): Promise<AnalyticsConfig> {
  if (typeof window === 'undefined') {
    return { googleAnalyticsId: 'G-XXXXXXXXXX', cloudflareGoogleAnalyticsId: undefined, clarityId: undefined };
  }

  try {
    const response = await fetch('/analytics-config.json');
    if (!response.ok) {
      throw new Error('Failed to load analytics config');
    }
    const config = await response.json();
    const googleAnalyticsId = isCloudflareEnvironment()
      ? config.cloudflareGoogleAnalyticsId || config.googleAnalyticsId || 'G-XXXXXXXXXX'
      : config.googleAnalyticsId || 'G-XXXXXXXXXX';

    return {
      googleAnalyticsId,
      cloudflareGoogleAnalyticsId: typeof config.cloudflareGoogleAnalyticsId === 'string' ? config.cloudflareGoogleAnalyticsId : undefined,
      clarityId: typeof config.clarityId === 'string' && config.clarityId.trim() ? config.clarityId.trim() : undefined,
    };
  } catch {
    return { googleAnalyticsId: 'G-XXXXXXXXXX', cloudflareGoogleAnalyticsId: undefined, clarityId: undefined };
  }
}
