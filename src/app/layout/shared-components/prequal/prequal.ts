import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'app-prequal',
  imports: [],
  templateUrl: './prequal.html',
  styleUrls: ['./prequal.scss'],
})
export class Prequal {
  private contentService = inject(ContentService);
  private sanitizer = inject(DomSanitizer);

  content = this.contentService.getHomeContent().prequal;
  iframeSrc: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.content.iframeSrc);
}
