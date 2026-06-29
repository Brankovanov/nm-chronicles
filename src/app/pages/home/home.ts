import { Component } from '@angular/core';

import { About } from '../../layout/shared-components/about/about';
import { Author } from '../../layout/shared-components/author/author';
import { Characters } from '../../layout/shared-components/characters/characters';
import { City } from '../../layout/shared-components/city/city';
import { Contacts } from '../../layout/shared-components/contacts/contacts';
import { Hero } from '../../layout/shared-components/hero/hero';
import { Prequal } from '../../layout/shared-components/prequal/prequal';
import { Quotations } from '../../layout/shared-components/quotations/quotations';

@Component({
  selector: 'app-home',
  imports: [
    Hero,
    About,
    Prequal,
    Characters,
    Quotations,
    City,
    Author,
    Contacts,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
