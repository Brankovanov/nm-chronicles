import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SocialShareService } from '../../../services/social-share.service';
import { siFacebook, siX, siInstagram, siPinterest } from 'simple-icons';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-share-on',
  standalone: true,
  imports: [NgClass],
  templateUrl: './share-on.html',
  styleUrls: ['./share-on.scss'],
})
export class ShareOn {
  private readonly socialShareService = inject(SocialShareService);
  private readonly sanitizer = inject(DomSanitizer);

  @Input() url = '';
  @Input() text = '';
  @Input() mediaUrl = '';
  @Input() isLightbox = false;

  readonly facebookIcon = this.iconSvg(siFacebook);
  readonly xIcon = this.iconSvg(siX);
  readonly instagramIcon = this.iconSvg(siInstagram);
  readonly pinterestIcon = this.iconSvg(siPinterest);

  shareOn(platform: 'facebook' | 'x' | 'instagram' | 'pinterest'): void {
    const url = this.url || (typeof window !== 'undefined' ? window.location.href : '');
    this.socialShareService.shareOn(platform, url, this.text, this.mediaUrl);
  }

  private iconSvg(icon: { svg: string }): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      icon.svg.replace('<svg ', '<svg fill="currentColor" ')
    );
  }
}
