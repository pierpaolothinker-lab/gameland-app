import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tressette',
    pathMatch: 'full',
  },
  {
    path: 'loader',
    loadComponent: () => import('./pages/loader/loader.page').then( m => m.LoaderPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'tressette4-inc',
    loadComponent: () => import('./pages/tressette4-inc/tressette4-inc.page').then( m => m.Tressette4IncPage)
  },
  {
    path: 'tressette',
    redirectTo: 'table3s74i',
    pathMatch: 'full',
  },
  {
    path: 'table3s74i',
    loadComponent: () => import('./pages/table3s74i/table3s74i.page').then( m => m.Table3s74iPage)
  },

];
