import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private readonly countState = signal(0);
  private readonly messageState = signal('Loading…');
  private readonly delayedHideState = signal(false);
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  readonly active = computed(
    () => this.countState() > 0 || this.delayedHideState()
  );
  readonly message = computed(() => this.messageState());

  show(message?: string): void {
    if (message) {
      this.messageState.set(message);
    }

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
      this.delayedHideState.set(false);
    }

    this.countState.update((value) => value + 1);
  }

  hide(): void {
    this.countState.update((value) => Math.max(0, value - 1));

    if (this.countState() === 0) {
      this.delayedHideState.set(true);
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
      }

      this.hideTimer = setTimeout(() => {
        if (this.countState() === 0) {
          this.delayedHideState.set(false);
        }
        this.hideTimer = null;
      }, 500);
    }
  }

  toggle(isLoading: boolean, message?: string): void {
    if (isLoading) {
      this.show(message);
    } else {
      this.hide();
    }
  }
}
