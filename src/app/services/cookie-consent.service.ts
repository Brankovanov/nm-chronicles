import { computed, inject, Injectable, signal } from '@angular/core';

export type CookieConsentDecision = 'accepted' | 'declined';
const COOKIE_CONSENT_KEY = 'nm-chronicles-cookie-consent';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly consentState = signal<CookieConsentDecision | null>(null);

  readonly consent = this.consentState;
  readonly hasDecision = computed(() => this.consent() !== null);
  readonly analyticsAllowed = computed(() => this.consent() === 'accepted');

  constructor() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY) as CookieConsentDecision | null;
    if (stored === 'accepted' || stored === 'declined') {
      this.consentState.set(stored);
    }
  }

  accept(): void {
    this.setConsent('accepted');
  }

  decline(): void {
    this.setConsent('declined');
  }

  private setConsent(decision: CookieConsentDecision): void {
    this.consentState.set(decision);
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, decision);
    }
  }
}
