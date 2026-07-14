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

  shareLink(url: string, title: string, text: string): void {
    const absoluteUrl = this.buildAbsoluteUrl(url);
    const shareData = { title, text, url: absoluteUrl };

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      navigator.share(shareData).catch(() => {
        this.openTwitter(absoluteUrl, text);
      });
      return;
    }

    this.openTwitter(absoluteUrl, text);
  }

  shareOn(
    platform: 'twitter' | 'facebook' | 'instagram' | 'pinterest',
    url: string,
    text: string,
    mediaUrl?: string
  ): void {
    const absoluteUrl = this.buildAbsoluteUrl(url);

    switch (platform) {
      case 'twitter':
        this.openTwitter(absoluteUrl, text);
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

  private openTwitter(url: string, text: string): void {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
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

  private openInstagram(url: string, text: string): void {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
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
