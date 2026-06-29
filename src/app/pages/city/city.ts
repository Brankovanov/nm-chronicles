import { Component } from '@angular/core';
import { Contacts } from '../../layout/shared-components/contacts/contacts';

@Component({
  selector: 'app-city',
  imports: [Contacts],
  templateUrl: './city.html',
  styleUrl: './city.scss',
})
export class City {}
