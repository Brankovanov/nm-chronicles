import { Component, inject } from '@angular/core';
import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrls: ['./about.scss'],
})
export class About {
  private contentService = inject(ContentService);

  content = this.contentService.getHomeContent().about;
}
