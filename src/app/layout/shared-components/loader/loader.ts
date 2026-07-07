import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-loader',
  templateUrl: './loader.html',
  styleUrls: ['./loader.scss'],
  host: {
    class: 'loader',
    '[class.loader--inline]': 'inline',
    '[style.--loader-color]': 'color',
    '[style.--loader-spinner-color]': 'spinnerColor',
  },
})
export class Loader {
  @Input() message = 'Loading…';
  @Input() inline = false;
  @Input() color = 'var(--gold)';
  @Input() spinnerColor = 'var(--gold-light)';
}
