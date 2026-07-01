import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CharacterDataService, CharacterDTO } from '../../../services/character-data.service';

@Component({
  selector: 'app-characters',
  imports: [RouterLink],
  templateUrl: './characters.html',
  styleUrls: ['./characters.scss'],
})
export class Characters {
  private characterDataService = inject(CharacterDataService);

  characters = signal<CharacterDTO[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.loadCharacters();
  }

  private async loadCharacters(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const value = await this.characterDataService.getCharacters();
      this.characters.set(value);
    } catch {
      this.error.set('Unable to load character data.');
    } finally {
      this.loading.set(false);
    }
  }
}
