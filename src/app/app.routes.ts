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
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'debug-avatars',
    loadComponent: () => import('./pages/debug-avatars/debug-avatars.page').then((m) => m.DebugAvatarsPage),
  },
  {
    path: 'debug/cards-catalog',
    loadComponent: () => import('./pages/debug-cards-catalog/debug-cards-catalog.page').then((m) => m.DebugCardsCatalogPage),
  },
  {
    path: 'table3s74i/:tableId',
    canActivate: [mockAuthGuard],
    loadComponent: () => import('./pages/table3s74i/table3s74i.page').then((m) => m.Table3s74iPage),
  },
  {
    path: 'tressette4-inc',
    canActivate: [mockAuthGuard],
    loadComponent: () => import('./pages/tressette4-inc/tressette4-inc.page').then((m) => m.Tressette4IncPage),
  },
  {
    path: '',
    canActivate: [mockAuthGuard],
    loadComponent: () => import('./pages/mobile-shell/mobile-shell.page').then((m) => m.MobileShellPage),
    children: [
      {
        path: '',
        redirectTo: 'game-select',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'game-select',
        pathMatch: 'full',
      },
      {
        path: 'game-select',
        loadComponent: () => import('./pages/game-select/game-select.page').then((m) => m.GameSelectPage),
        data: {
          shellTitle: 'Giochi',
          shellSubtitle: 'Navigazione primaria per scegliere il prossimo tavolo.',
          shellTab: 'games',
        },
      },
      {
        path: 'tressette-lobby',
        loadComponent: () => import('./pages/tressette-lobby/tressette-lobby.page').then((m) => m.TressetteLobbyPage),
        data: {
          shellTitle: 'Lobby',
          shellSubtitle: 'Tavoli, owner actions e posti disponibili in tempo reale.',
          shellTab: 'lobby',
        },
      },
      {
        path: 'chat',
        loadComponent: () => import('./pages/chat/chat.page').then((m) => m.ChatPage),
        data: {
          shellTitle: 'Chat',
          shellSubtitle: 'Hub conversazioni rapido pensato per una mano sola.',
          shellTab: 'chat',
        },
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
        data: {
          shellTitle: 'Profilo',
          shellSubtitle: 'Sessione, preferenze locali e utility personali.',
          shellTab: 'profile',
        },
      },
    ],
  },
  {
    path: 'tressette',
    redirectTo: 'tressette-lobby',
    pathMatch: 'full',
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
