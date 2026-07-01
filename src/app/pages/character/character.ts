import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CharacterDataService, CharacterDTO } from '../../services/character-data.service';
import { Contacts } from '../../layout/shared-components/contacts/contacts';
import { LightHouse } from '../../layout/shared-components/light-house/light-house';

@Component({
  selector: 'app-character',
  imports: [Contacts, LightHouse],
  templateUrl: './character.html',
  styleUrls: ['./character.scss'],
})
export class Character {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private characterDataService = inject(CharacterDataService);

  character = signal<CharacterDTO | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  characterName = computed(() => this.character()?.name ?? '');
  characterTagline = computed(() => this.character()?.tagline ?? '');
  characterQuote = computed(() => this.character()?.quote ?? '');

  constructor() {
    this.loadCharacter();
  }

  private async loadCharacter(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const state = this.router.getCurrentNavigation()?.extras.state as { character?: CharacterDTO } | undefined;
    if (state?.character) {
      this.character.set(state.character);
      this.loading.set(false);
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
    }
  }
}
