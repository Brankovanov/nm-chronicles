import { Component } from '@angular/core';
import { Contacts } from '../../layout/shared-components/contacts/contacts';
import { LightHouse } from "../../layout/shared-components/light-house/light-house";

@Component({
  selector: 'app-character',
  imports: [Contacts, LightHouse],
  templateUrl: './character.html',
  styleUrl: './character.scss',
})
export class Character {}
