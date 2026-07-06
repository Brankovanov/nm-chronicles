import { Injectable } from '@angular/core';
import homeContent from '../../../assets/data/home-content.json';

export interface HomeContent {
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaLabel: string;
    ctaTarget: string;
    scrollHint: string;
    scrollTarget: string;
  };
  about: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    paragraphs: string[];
    stats: Array<{ value: string; label: string }>;
    image: { src: string; alt: string };
  };
  prequal: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    lead: string;
    iframeSrc: string;
    iframeTitle: string;
    linkText: string;
    linkHref: string;
  };
  characters: {
    label: string;
    title: string;
    lead: string;
    loadingMessage: string;
    errorMessage: string;
    footnoteText: string;
    wikiLinkText: string;
    wikiLinkHref: string;
  };
  quotations: {
    label: string;
    title: string;
    quotes: Array<{ text: string; cite: string }>;
  };
  city: {
    label: string;
    title: string;
    lead: string;
    ariaLabel: string;
    imageAlt: string;
    linkHint: string;
    captionText: string;
  };
  author: {
    label: string;
    title: string;
    imageAlt: string;
    description: string;
  };
  contacts: {
    label: string;
    title: string;
    lead: string;
    links: Array<{ href: string; siteLink: string; icon: string; label: string; description: string }>;
  };
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private content = homeContent as HomeContent;

  getHomeContent(): HomeContent {
    return this.content;
  }
}
