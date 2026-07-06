import { Component, inject } from '@angular/core';
import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'app-author',
  imports: [],
  templateUrl: './author.html',
  styleUrls: ['./author.scss'],
})
export class Author {
  private contentService = inject(ContentService);

  content = this.contentService.getHomeContent().author;
}
