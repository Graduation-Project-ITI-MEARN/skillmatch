import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
// Standard convention is AppComponent
export class App {
  constructor(private languageService: LanguageService) {}
}
