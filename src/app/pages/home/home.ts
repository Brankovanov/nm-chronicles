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
      const [about, prequal, characters, quotations, city, author] = await Promise.all([
        import('../../layout/shared-components/about/about'),
        import('../../layout/shared-components/prequal/prequal'),
        import('../../layout/shared-components/characters/characters'),
        import('../../layout/shared-components/quotations/quotations'),
        import('../../layout/shared-components/city/city'),
        import('../../layout/shared-components/author/author'),
      ]);

      this.aboutComponent.set(about.About);
      this.prequalComponent.set(prequal.Prequal);
      this.charactersComponent.set(characters.Characters);
      this.quotationsComponent.set(quotations.Quotations);
      this.cityComponent.set(city.City);
      this.authorComponent.set(author.Author);
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
