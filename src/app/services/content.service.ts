import { Injectable } from '@angular/core';
import homeContent from '../../../assets/data/home-content.json';
import templateContent from '../../../assets/data/template-content.json';

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

export interface TemplateContent {
  header: {
    logo: string;
    backToHome: string;
    about: string;
    listen: string;
    characters: string;
    city: string;
    author: string;
    connect: string;
  };
  footer: {
    logo: string;
    subtitle: string;
    credit: string;
    copy: string;
  };
  cityPage: {
    heroEyebrow: string;
    generalLabel: string;
    viewMapLabel: string;
    districtsLabel: string;
    districtsTitle: string;
    backToHome: string;
    charactersLink: string;
    fandomWikiLabel: string;
  };
  characterPage: {
    pageEyebrow: string;
    loadingTitle: string;
    notFoundTitle: string;
    profileTitle: string;
    propertyLabels: {
      name: string;
      race: string;
      abilities: string;
      role: string;
      age: string;
      hair: string;
      eyes: string;
      affiliations: string;
      traits: string;
    };
    sectionTitle: string;
    portraitLabel: string;
    insigniaLabel: string;
    turnaroundLabel: string;
    viewSheetLabel: string;
    backToCharacters: string;
    fandomWikiLabel: string;
    listenPrequel: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private content = homeContent as HomeContent;
  private template = templateContent as TemplateContent;

  getHomeContent(): HomeContent {
    return this.content;
  }

  getTemplateContent(): TemplateContent {
    return this.template;
  }
}
