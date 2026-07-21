import { Component, effect, inject, signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { Navigation, Router } from '@angular/router';

import { Contacts } from '../../layout/shared-components/contacts/contacts';
import { Hero } from '../../layout/shared-components/hero/hero';
import { SectionNavigation } from '../../layout/shared-components/section-navigation/section-navigation';
import { ScrollService } from '../../services/scroll.service';
import { ViewChangeService } from '../../services/view-change.service';

@Component({
  selector: 'app-home',
  imports: [
    Hero,
    Contacts,
    SectionNavigation,
    NgComponentOutlet,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {
  private viewChangeService = inject(ViewChangeService);
  private router = inject(Router);
  private scrollService = inject(ScrollService);
  public isDesktopFlag = signal(this.viewChangeService.isDesktop());

  aboutComponent = signal<Type<unknown> | null>(null);
  prequalComponent = signal<Type<unknown> | null>(null);
  charactersComponent = signal<Type<unknown> | null>(null);
  quotationsComponent = signal<Type<unknown> | null>(null);
  cityComponent = signal<Type<unknown> | null>(null);
  authorComponent = signal<Type<unknown> | null>(null);

  private isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';


  constructor() {
    effect(() => {
      this.isDesktopFlag.set(this.viewChangeService.isDesktop());
    });

    if (this.isBrowser) {
      const navigationState = this.router.getCurrentNavigation()?.extras.state as { homeSection?: string } | null;
      const stateFromHistory = (history.state as { homeSection?: string } | null)?.homeSection;
      const homeSection = navigationState?.homeSection ?? stateFromHistory;
      const originSection = this.inferHomeSectionFromNavigation(this.router.getCurrentNavigation());
      const sectionToScroll = homeSection ?? originSection;

      if (sectionToScroll) {
        this.scrollToHomeSectionWhenReady(sectionToScroll);
      }

      this.deferLoadHomeSections();
    }
  }

  private inferHomeSectionFromNavigation(navigation: Navigation | null): string | null {
    if (!navigation?.previousNavigation) {
      return null;
    }

    const previousUrl = navigation.previousNavigation.finalUrl?.toString() ?? navigation.previousNavigation.extractedUrl?.toString();
    if (!previousUrl) {
      return null;
    }

    if (previousUrl.includes('/city')) {
      return 'map';
    }

    if (previousUrl.includes('/character')) {
      return 'characters';
    }

    return null;
  }

  private scrollToHomeSectionWhenReady(section: string): void {
    const maxRetries = 20;
    let retries = 0;

    const attemptScroll = (): void => {
      retries += 1;
      const element = document.getElementById(section);
      if (element) {
        this.scrollService.scrollTo(section);
        window.history.replaceState({}, '');
        return;
      }

      if (retries < maxRetries) {
        requestAnimationFrame(attemptScroll);
      }
    };

    requestAnimationFrame(attemptScroll);
  }

  private deferLoadHomeSections(): void {
    const loadSections = async () => {
      const results = await Promise.allSettled([
        import('../../layout/shared-components/about/about'),
        import('../../layout/shared-components/prequal/prequal'),
        import('../../layout/shared-components/characters/characters'),
        import('../../layout/shared-components/quotations/quotations'),
        import('../../layout/shared-components/city/city'),
        import('../../layout/shared-components/author/author'),
      ]);

      if (results[0].status === 'fulfilled') {
        this.aboutComponent.set(results[0].value.About);
      } else {
        console.error('Failed to load about section', results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        this.prequalComponent.set(results[1].value.Prequal);
      } else {
        console.error('Failed to load prequal section', results[1].reason);
      }

      if (results[2].status === 'fulfilled') {
        this.charactersComponent.set(results[2].value.Characters);
      } else {
        console.error('Failed to load characters section', results[2].reason);
      }

      if (results[3].status === 'fulfilled') {
        this.quotationsComponent.set(results[3].value.Quotations);
      } else {
        console.error('Failed to load quotations section', results[3].reason);
      }

      if (results[4].status === 'fulfilled') {
        this.cityComponent.set(results[4].value.City);
      } else {
        console.error('Failed to load city section', results[4].reason);
      }

      if (results[5].status === 'fulfilled') {
        this.authorComponent.set(results[5].value.Author);
      } else {
        console.error('Failed to load author section', results[5].reason);
      }
    };

    const globalWindow = window as unknown as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => void;
    };

    if ('requestIdleCallback' in globalWindow && typeof globalWindow.requestIdleCallback === 'function') {
      globalWindow.requestIdleCallback(loadSections, { timeout: 2000 });
    } else {
      globalWindow.addEventListener('load', () => void loadSections(), { once: true, passive: true });
      setTimeout(() => void loadSections(), 2000);
    }
  }
}
