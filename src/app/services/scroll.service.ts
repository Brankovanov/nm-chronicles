import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  scrollTo(id: string, options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }): void {
    document.getElementById(id)?.scrollIntoView(options);
  }
}
