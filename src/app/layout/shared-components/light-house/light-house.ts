import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { LightHouseService } from './light-house.service';
import { ShareOn } from '../share-on/share-on';

@Component({
  selector: 'app-light-house',
  imports: [ShareOn],
  templateUrl: './light-house.html',
  styleUrls: ['./light-house.scss'],
})
export class LightHouse {
  private readonly document = inject(DOCUMENT);
  private readonly lightHouseService = inject(LightHouseService);
  private readonly previouslyFocusedElement = signal<HTMLElement | null>(null);

  readonly isOpen = this.lightHouseService.isOpen;
  readonly src = this.lightHouseService.src;
  readonly alt = this.lightHouseService.alt;
  readonly description = this.lightHouseService.description;

  constructor() {
    effect(() => {
      const isOpen = this.isOpen();
      if (isOpen) {
        this.previouslyFocusedElement.set(this.document?.activeElement as HTMLElement | null);
        this.document?.addEventListener('keydown', this.onKeydown, true);
        const dialog = this.document?.getElementById('lightbox-dialog') as HTMLElement | null;
        dialog?.focus();
      } else {
        this.document?.removeEventListener('keydown', this.onKeydown, true);
        this.previouslyFocusedElement()?.focus?.();
      }
    });
  }

  close(event?: Event): void {
    event?.stopPropagation();
    this.lightHouseService.hide();
  }

  private onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
    }
  };
}

