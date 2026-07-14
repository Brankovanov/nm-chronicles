import { Component, inject } from '@angular/core';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
})
export class Footer {
  private readonly contentService = inject(ContentService);
  footer = this.contentService.getTemplateContent().footer;
}
