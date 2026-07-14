import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CharacterDataService, CharacterDTO } from '../../services/character-data.service';
import { Contacts } from '../../layout/shared-components/contacts/contacts';
import { Loader } from '../../layout/shared-components/loader/loader';
import { LoaderService } from '../../services/loader.service';
import { LightHouseService } from '../../layout/shared-components/light-house/light-house.service';
import { APP_ENVIRONMENT_CONFIG, buildAssetUrl } from '../../config';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ContentService } from '../../services/content.service';
import { ShareOn } from '../../layout/shared-components/share-on/share-on';

@Component({
  selector: 'app-character',
  imports: [Contacts, Loader, ScrollRevealDirective, RouterLink, ShareOn],
  templateUrl: './character.html',
  styleUrls: ['./character.scss'],
})
export class Character {
  private readonly lightHouseService = inject(LightHouseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private characterDataService = inject(CharacterDataService);
  private readonly loaderService = inject(LoaderService);
  readonly envConfig = inject(APP_ENVIRONMENT_CONFIG);
  private readonly contentService = inject(ContentService);
  assetUrl = (path: string) => buildAssetUrl(this.envConfig.assetBasePath, path);
  template = this.contentService.getTemplateContent().characterPage;
  character = signal<CharacterDTO | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly shareUrl = computed(
    () =>
      typeof window !== 'undefined'
        ? window.location.href
        : this.envConfig.canonicalUrl
  );
  characterName = computed(() => this.character()?.name ?? '');
  characterTagline = computed(() => this.character()?.tagline ?? '');
  characterQuote = computed(() => this.character()?.quote ?? '');

  constructor() {
    this.loadCharacter();
  }

  openLightbox(src: string, alt = ''): void {
    console.log(`Character: openLightbox() called `);
    this.lightHouseService.show(src, alt);
  }

  navigateHome(event: MouseEvent, section: string): void {
    event.preventDefault();
    this.router.navigate([''], { state: { homeSection: section } });
  }

  private async loadCharacter(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.loaderService.show('Loading character details…');

    const state = this.router.getCurrentNavigation()?.extras.state as { character?: CharacterDTO } | undefined;
    if (state?.character) {
      this.character.set(state.character);
      this.loading.set(false);
      this.loaderService.hide();
      return;
    }

    const slug = this.route.snapshot.paramMap.get('id');
    if (!slug) {
      this.error.set('Character not found.');
      this.loading.set(false);
      return;
    }

    try {
      const character = await this.characterDataService.getCharacter(slug);
      if (!character) {
        this.error.set('Character not found.');
      } else {
        this.character.set(character);
      }
    } catch {
      this.error.set('Unable to load character details.');
    } finally {
      this.loading.set(false);
      this.loaderService.hide();
    }
  }
}
