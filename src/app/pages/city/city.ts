import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Contacts } from '../../layout/shared-components/contacts/contacts';
import { LightHouseService } from '../../layout/shared-components/light-house/light-house.service';
import { CityData, CityDataService } from '../../services/city-data.service';
import { APP_ENVIRONMENT_CONFIG, buildAssetUrl } from '../../config';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-city',
  imports: [Contacts, ScrollRevealDirective, RouterLink],
  templateUrl: './city.html',
  styleUrls: ['./city.scss'],
})
export class City {
  private readonly lightHouseService = inject(LightHouseService);
  private readonly cityDataService = inject(CityDataService);
  private readonly envConfig = inject(APP_ENVIRONMENT_CONFIG);
  private readonly router = inject(Router);

  city = signal<CityData | null>(null);
  districts = computed(() => [...(this.city()?.districts ?? [])].sort((left, right) => left.displayOrder - right.displayOrder));
  cityName = computed(() => this.city()?.name ?? '');
  citySubtitle = computed(() => this.city()?.subtitle ?? '');
  cityOverview = computed(() => this.city()?.overview ?? '');
  mapImageSrc = computed(() => this.city()?.mapImage?.src ?? '');
  mapImageAlt = computed(() => this.city()?.mapImage?.alt ?? '');

  assetUrl = (path: string) => buildAssetUrl(this.envConfig.assetBasePath, path);

  constructor() {
    this.city.set(this.cityDataService.getCity());
  }

  openLightbox(src: string, alt = ''): void {
    this.lightHouseService.show(src, alt);
  }

  navigateHome(event: MouseEvent, section: string): void {
    event.preventDefault();
    this.router.navigate([''], { state: { homeSection: section } });
  }
}
