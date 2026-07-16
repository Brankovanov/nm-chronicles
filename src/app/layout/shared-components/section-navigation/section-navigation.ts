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
      requestAnimationFrame(() => this.createSectionObserver());
    }
  }

  scrollToPrevious(): void {
    const index = this.currentSectionIndex();
    if (index <= 0) {
      return;
    }

    this.scrollTo(this.sections[index - 1].id);
  }

  scrollToNext(): void {
    const index = this.currentSectionIndex();
    if (index >= this.sections.length - 1) {
      return;
    }

    this.scrollTo(this.sections[index + 1].id);
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
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
      }
    }
  }

  private scrollTo(id: string): void {
    this.scrollService.scrollTo(id, { behavior: 'smooth', block: 'start' });
  }
}
