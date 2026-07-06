import { Component, inject } from '@angular/core';
import { ScrollService } from '../../../services/scroll.service';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss'],
})
export class Hero {
  constructor(private scrollService: ScrollService) { }

  scrollTo(id: string): void {
    this.scrollService.scrollTo(id);
  }
}
