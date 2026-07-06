import { Component, inject } from '@angular/core';
import { ScrollService } from '../../../services/scroll.service';
import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss'],
})
export class Hero {
  private scrollService = inject(ScrollService);
  private contentService = inject(ContentService);

  content = this.contentService.getHomeContent().hero;

  scrollTo(id: string): void {
    this.scrollService.scrollTo(id);
  }
}
