import { Component, inject } from '@angular/core';
import { ScrollService } from '../../../services/scroll.service';
import { ContentService } from '../../../services/content.service';
import { APP_ENVIRONMENT_CONFIG, buildAssetUrl } from '../../../config';
import { ScrollRevealDirective } from '../../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-hero',
  imports: [ScrollRevealDirective],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss'],
})
export class Hero {
  private scrollService = inject(ScrollService);
  private contentService = inject(ContentService);
  private readonly envConfig = inject(APP_ENVIRONMENT_CONFIG);

  content = this.contentService.getHomeContent().hero;
  assetUrl = (path: string) => buildAssetUrl(this.envConfig.assetBasePath, path);

  scrollTo(id: string): void {
    this.scrollService.scrollTo(id);
  }
}
