import { AppRoute } from './app-route.enum';
import { MenuOption } from '../../types/menu-option.interface';

export const MAIN_MENU_OPTIONS: MenuOption[] = [
  {
    text: 'Slider Input',
    url: AppRoute.primary
  },
  {
    text: 'Text Input',
    url: AppRoute.converter
  },
  {
    text: 'Info',
    url: AppRoute.info
  }
];
