import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private readonly countState = signal(0);
  private readonly messageState = signal('Loading…');

  readonly active = computed(() => this.countState() > 0);
  readonly message = computed(() => this.messageState());

  show(message?: string): void {
    if (message) {
      this.messageState.set(message);
    }
    this.countState.update((value) => value + 1);
  }

  hide(): void {
    setTimeout(() => {
      this.countState.update((value) => Math.max(0, value - 1));
    }, 100);
    // this.countState.update((value) => Math.max(0, value - 1));
  }

  toggle(isLoading: boolean, message?: string): void {
    if (isLoading) {
      this.show(message);
    } else {
      this.hide();
    }
  }
}
