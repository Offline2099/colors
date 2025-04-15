import { Routes } from '@angular/router';
import { AppRoute } from './constants/app/app-route.enum';
import { PrimaryComponent } from './components/01-primary/primary.component';
import { ConverterComponent } from './components/02-converter/converter.component';
import { InfoComponent } from './components/03-info/info.component';

export const routes: Routes = [
  { path: AppRoute.primary, component: PrimaryComponent },
  { path: AppRoute.converter, component: ConverterComponent },
  { path: AppRoute.info, component: InfoComponent },
  { path: '', redirectTo: `/${AppRoute.primary}`, pathMatch: 'full' }
];

