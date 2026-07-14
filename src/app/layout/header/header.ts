import { Component, computed, effect, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { ScrollService } from '../../services/scroll.service';
import { ViewChangeService } from '../../services/view-change.service';
import { ContentService, TemplateContent } from '../../services/content.service';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  private router = inject(Router);
  private scrollService = inject(ScrollService);
  private viewChangeService = inject(ViewChangeService);
  private contentService = inject(ContentService);
  header = this.contentService.getTemplateContent().header;
  isPage: Signal<boolean> = computed(() => (this.currentUrl()?.includes('city') || this.currentUrl()?.includes('character')) ?? false);
  homeBackSection = computed(() => {
    const url = this.currentUrl() ?? '';
    if (url.includes('/city')) {
      return 'map';
    }
    if (url.includes('/character')) {
      return 'characters';
    }
    return null;
  });
  menuOpen: WritableSignal<boolean> = signal(false);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects),
      startWith(this.router.url) // captures initial load
    )
  );

  constructor() {
    effect(() => {
      if (this.viewChangeService.isDesktop()) {
        this.closeMenu();
      }
    });

    effect(() => {
      this.currentUrl();
      this.closeMenu();
    });
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  goHome(event: MouseEvent, section: string | null): void {
    event.preventDefault();
    this.router.navigate([''], { state: section ? { homeSection: section } : {} });
    this.closeMenu();
  }

  scrollTo(id: string): void {
    this.scrollService.scrollTo(id);
    this.closeMenu();
  }
}
