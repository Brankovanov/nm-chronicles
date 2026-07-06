import { Component, inject } from '@angular/core';
import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'app-contacts',
  imports: [],
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.scss'],
})
export class Contacts {
  private contentService = inject(ContentService);

  content = this.contentService.getHomeContent().contacts;
}
