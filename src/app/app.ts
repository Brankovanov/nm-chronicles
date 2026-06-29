import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { LightHouse } from "./layout/shared-components/light-house/light-house";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, LightHouse],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('nm-chronicles');
}