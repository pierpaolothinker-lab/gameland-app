import { Routes } from '@angular/router';

import { mockAuthGuard } from './guards/mock-auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'loader',
    loadComponent: () => import('./pages/loader/loader.page').then((m) => m.LoaderPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'game-select',
    canActivate: [mockAuthGuard],
    loadComponent: () => import('./pages/game-select/game-select.page').then((m) => m.GameSelectPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'home',
    redirectTo: 'game-select',
    pathMatch: 'full',
  },
  {
    path: 'tressette-lobby',
    canActivate: [mockAuthGuard],
    loadComponent: () => import('./pages/tressette-lobby/tressette-lobby.page').then((m) => m.TressetteLobbyPage),
  },
  {
    path: 'tressette',
    redirectTo: 'tressette-lobby',
    pathMatch: 'full',
  },
  {
    path: 'tressette4-inc',
    canActivate: [mockAuthGuard],
    loadComponent: () => import('./pages/tressette4-inc/tressette4-inc.page').then((m) => m.Tressette4IncPage),
  },
  {
    path: 'table3s74i/:tableId',
    canActivate: [mockAuthGuard],
    loadComponent: () => import('./pages/table3s74i/table3s74i.page').then((m) => m.Table3s74iPage),
  },
  {
    path: 'debug/cards-catalog',
    loadComponent: () => import('./pages/debug-cards-catalog/debug-cards-catalog.page').then((m) => m.DebugCardsCatalogPage),
  },
  {
    path: 'table3s74i',
    redirectTo: 'tressette-lobby',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
