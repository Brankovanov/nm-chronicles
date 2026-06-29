import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'character/:id',
    loadComponent: () =>
      import('./pages/character/character').then(
        m => m.Character
      ),
  },
  {
    path: 'city',
    loadComponent: () =>
      import('./pages/city/city').then(m => m.City),
  },
  {
    path: '**',
    redirectTo: '',
  },
];