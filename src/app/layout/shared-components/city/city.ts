import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'app-city',
  imports: [RouterLink],
  templateUrl: './city.html',
  styleUrls: ['./city.scss'],
})
export class City {
  private contentService = inject(ContentService);

  content = this.contentService.getHomeContent().city;
}
