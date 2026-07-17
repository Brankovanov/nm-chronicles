import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { ScrollService } from '../../../services/scroll.service';

interface SectionEntry {
  id: string;
  label: string;
}

const SECTIONS: SectionEntry[] = [
  { id: 'main', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'listen', label: 'Listen' },
  { id: 'characters', label: 'Characters' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'map', label: 'Map' },
  { id: 'author', label: 'Author' },
  { id: 'connect', label: 'Connect' },
];

@Component({
  selector: 'app-section-navigation',
  templateUrl: './section-navigation.html',
  styleUrls: ['./section-navigation.scss'],
})
export class SectionNavigation implements OnDestroy {
  private readonly scrollService = inject(ScrollService);
  private readonly isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  private sectionObserver?: IntersectionObserver;
  private observedSections = new Set<string>();
  currentSection = signal(SECTIONS[0].id);

  sections = SECTIONS;
  currentSectionIndex = computed(() => this.sections.findIndex(section => section.id === this.currentSection()));
  currentLabel = computed(() => this.sections[this.currentSectionIndex()]?.label ?? '');
  previousSection = computed(() => this.sections[this.currentSectionIndex() - 1]);
  nextSection = computed(() => this.sections[this.currentSectionIndex() + 1]);
  canScrollPrevious = computed(() => this.currentSectionIndex() > 0);
  canScrollNext = computed(() => this.currentSectionIndex() < this.sections.length - 1);

  constructor() {
    if (this.isBrowser) {
      requestAnimationFrame(() => {
        this.createSectionObserver();
        this.checkForPendingSections();
        window.addEventListener('scroll', this.onScroll, { passive: true });
        window.addEventListener('resize', this.onScroll, { passive: true });
      });
    }
  }

  scrollToPrevious(): void {
    const index = this.currentSectionIndex();
    if (index <= 0) {
      return;
    }

    const targetId = this.sections[index - 1].id;
    this.scrollTo(targetId);
    this.currentSection.set(targetId);
  }

  scrollToNext(): void {
    const index = this.currentSectionIndex();
    if (index >= this.sections.length - 1) {
      return;
    }

    const targetId = this.sections[index + 1].id;
    this.scrollTo(targetId);
    this.currentSection.set(targetId);
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();

    if (this.isBrowser) {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onScroll);
    }
  }

  private createSectionObserver(): void {
    if (!this.isBrowser) {
      return;
    }

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleSections.length > 0) {
          this.currentSection.set(visibleSections[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: '-40% 0px -50% 0px',
        threshold: 0.1,
      }
    );

    for (const section of this.sections) {
      const element = document.getElementById(section.id);
      if (element) {
        this.sectionObserver.observe(element);
        this.observedSections.add(section.id);
      }
    }
  }

  private checkForPendingSections(): void {
    if (!this.isBrowser) {
      return;
    }

    let foundSection = false;
    for (const section of this.sections) {
      if (!this.sectionObserver || this.observedSections.has(section.id)) {
        continue;
      }

      const element = document.getElementById(section.id);
      if (element) {
        this.sectionObserver.observe(element);
        this.observedSections.add(section.id);
        foundSection = true;
      }
    }

    if (foundSection) {
      this.updateCurrentSectionFromViewport();
    }

    if (this.sections.some((section) => !this.observedSections.has(section.id))) {
      requestAnimationFrame(() => this.checkForPendingSections());
    }
  }

  private onScroll = (): void => {
    this.updateCurrentSectionFromViewport();
  };

  private updateCurrentSectionFromViewport(): void {
    if (!this.isBrowser) {
      return;
    }

    const viewportMiddle = window.innerHeight * 0.35;
    let activeSection = this.sections[0].id;

    for (const section of this.sections) {
      const element = document.getElementById(section.id);
      if (!element) {
        continue;
      }

      const rect = element.getBoundingClientRect();
      if (rect.top <= viewportMiddle && rect.bottom > 0) {
        activeSection = section.id;
      }
    }

    this.currentSection.set(activeSection);
  }

  private scrollTo(id: string): void {
    this.scrollService.scrollTo(id, { behavior: 'smooth', block: 'start' });
  }
}
