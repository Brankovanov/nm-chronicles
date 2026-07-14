import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SocialShareService {
  private readonly document = inject(DOCUMENT);

  private buildAbsoluteUrl(path: string): string {
    if (!path) {
      return '';
    }

    if (/^https?:\/\//.test(path)) {
      return path;
    }

    const origin = this.document?.location?.origin ?? '';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${origin}${normalizedPath}`;
  }

  private canUseWebShare(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  shareLink(url: string, title: string, text: string): void {
    const absoluteUrl = this.buildAbsoluteUrl(url);
    const shareData = { title, text, url: absoluteUrl };

    if (this.canUseWebShare()) {
      navigator.share(shareData).catch(() => {
        this.openX(absoluteUrl, text);
      });
      return;
    }

    this.openX(absoluteUrl, text);
  }

  shareOn(
    platform: 'facebook' | 'x' | 'instagram' | 'pinterest',
    url: string,
    text: string,
    mediaUrl?: string
  ): void {
    const absoluteUrl = this.buildAbsoluteUrl(url);

    switch (platform) {
      case 'x':
        this.openX(absoluteUrl, text);
        break;
      case 'facebook':
        this.openFacebook(absoluteUrl);
        break;
      case 'instagram':
        this.openInstagram(absoluteUrl, text);
        break;
      case 'pinterest':
        this.openPinterest(absoluteUrl, text, mediaUrl);
        break;
    }
  }

  private openWindow(url: string): void {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  private openX(url: string, text: string): void {
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    this.openWindow(shareUrl);
  }

  private openFacebook(url: string): void {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    this.openWindow(shareUrl);
  }

  private openWhatsApp(url: string, text: string): void {
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`;
    this.openWindow(shareUrl);
  }

  /**
   * Instagram has no public web intent for sharing a URL directly (unlike X/Facebook/Pinterest).
   * We fall back to the native Web Share API where available, and otherwise just
   * open instagram.com so the user can share manually.
   */
  private openInstagram(url: string, text: string): void {
    if (this.canUseWebShare()) {
      navigator.share({ title: 'Share on Instagram', text, url }).catch(() => {
        this.openWindow('https://www.instagram.com/');
      });
      return;
    }

    this.openWindow('https://www.instagram.com/');
  }

  private openPinterest(url: string, text: string, mediaUrl?: string): void {
    const params = new URLSearchParams({
      url,
      description: text,
    });

    if (mediaUrl) {
      params.set('media', this.buildAbsoluteUrl(mediaUrl));
    }

    const shareUrl = `https://pinterest.com/pin/create/button/?${params.toString()}`;
    this.openWindow(shareUrl);
  }
}