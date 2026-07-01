import { Injectable, Service } from '@angular/core';

export interface CharacterImageSet {
  src: string;
  alt: string;
}

export interface CharacterImages {
  sheet: CharacterImageSet;
  portrait: CharacterImageSet;
  item: CharacterImageSet;
  turnaround: CharacterImageSet;
}

export interface CharacterDTO {
  slug: string;
  name: string;
  tagline: string;
  quote: string;
  race: string;
  role: string;
  age: string;
  appearance: {
    hair: string;
    eyes: string;
  };
  abilities: string[];
  affiliations: string[];
  traits: string[];
  bio: string;
  images: CharacterImages;
  wikiUrl: string;
  revealOnHover?: boolean;
}

const CHARACTER_DATA_URL = '/assets/data/characters.json';

@Injectable({
  providedIn: 'root'
})
export class CharacterDataService {
  private cache: CharacterDTO[] | null = null;

  async getCharacters(): Promise<CharacterDTO[] | []> {
    if (this.cache) {
      return this.cache;
    }

    const response = await fetch(CHARACTER_DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load character data: ${response.statusText}`);
    }

    this.cache = await response.json();
    return this.cache ?? [];
  }

  async getCharacter(slug: string): Promise<CharacterDTO | null> {
    const characters = await this.getCharacters();
    return characters.find((character) => character.slug === slug) ?? null;
  }
}
