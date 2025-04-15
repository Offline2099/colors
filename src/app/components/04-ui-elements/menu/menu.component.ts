import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuOption } from '../../../types/menu-option.interface';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  label = input<string>('');
  options = input.required<MenuOption[]>()
  selectedId = input<string | number>('');

}
