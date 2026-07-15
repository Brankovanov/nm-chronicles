import { InjectionToken, inject } from '@angular/core';

export interface AnalyticsConfig {
  googleAnalyticsId: string;
}

export const ANALYTICS_CONFIG = new InjectionToken<AnalyticsConfig>('ANALYTICS_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    googleAnalyticsId: 'G-XXXXXXXXXX',
  }),
});

export async function loadAnalyticsConfig(): Promise<AnalyticsConfig> {
  if (typeof window === 'undefined') {
    return { googleAnalyticsId: 'G-XXXXXXXXXX' };
  }

  try {
    const response = await fetch('/analytics-config.json');
    if (!response.ok) {
      throw new Error('Failed to load analytics config');
    }
    const config = await response.json();
    return {
      googleAnalyticsId: config.googleAnalyticsId || 'G-XXXXXXXXXX',
    };
  } catch {
    return { googleAnalyticsId: 'G-XXXXXXXXXX' };
  }
}
