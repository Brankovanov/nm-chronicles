import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { About } from '../../layout/shared-components/about/about';
import { Author } from '../../layout/shared-components/author/author';
import { Characters } from '../../layout/shared-components/characters/characters';
import { City } from '../../layout/shared-components/city/city';
import { Contacts } from '../../layout/shared-components/contacts/contacts';
import { Hero } from '../../layout/shared-components/hero/hero';
import { Prequal } from '../../layout/shared-components/prequal/prequal';
import { Quotations } from '../../layout/shared-components/quotations/quotations';
import { SectionNavigation } from '../../layout/shared-components/section-navigation/section-navigation';
import { ScrollService } from '../../services/scroll.service';
import { ViewChangeService } from '../../services/view-change.service';

@Component({
  selector: 'app-home',
  imports: [
    Hero,
    About,
    Prequal,
    Characters,
    Quotations,
    City,
    Author,
    Contacts,
    SectionNavigation,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {
  private viewChangeService = inject(ViewChangeService);
  private router = inject(Router);
  private scrollService = inject(ScrollService);
  public isDesktopFlag = signal(this.viewChangeService.isDesktop());


  constructor() {
    effect(() => {
      this.isDesktopFlag.set(this.viewChangeService.isDesktop());
    });

    if (typeof window !== 'undefined') {
      const navigationState = this.router.getCurrentNavigation()?.extras.state as { homeSection?: string } | null;
      const homeSection = navigationState?.homeSection ?? (history.state as { homeSection?: string } | null)?.homeSection;
      if (homeSection) {
        setTimeout(() => { 
          this.scrollService.scrollTo(homeSection); 
          window.history.replaceState({}, '');
        }, 0);
      }
    }
  }
}
