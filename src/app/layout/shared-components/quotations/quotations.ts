import { Component, inject } from '@angular/core';
import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'app-quotations',
  imports: [],
  templateUrl: './quotations.html',
  styleUrls: ['./quotations.scss'],
})
export class Quotations {
  private contentService = inject(ContentService);

  content = this.contentService.getHomeContent().quotations;
}
