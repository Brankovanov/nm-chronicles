import { Component, effect, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { LightHouse } from './layout/shared-components/light-house/light-house';
import { Loader } from './layout/shared-components/loader/loader';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, LightHouse, Loader],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  private readonly router = inject(Router);
  private readonly loaderService = inject(LoaderService);

  readonly loading = this.loaderService.active;
  readonly loadingMessage = this.loaderService.message;
  protected readonly title = signal('nm-chronicles');

  constructor() {
    if (typeof document !== 'undefined') {
      effect(() => {
        document.body.classList.toggle('loader-active', this.loading());
      });
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loaderService.show('Loading page…');
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loaderService.hide();
      }
    });
  }
}