import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MAIN_MENU_OPTIONS } from './constants/app/main-menu-options';
import { FOOTER_LINKS } from './constants/app/footer-links';
import { MenuComponent } from './components/04-ui-elements/menu/menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  readonly MAIN_MENU_OPTIONS = MAIN_MENU_OPTIONS;
  readonly FOOTER_LINKS = FOOTER_LINKS;
  
}
