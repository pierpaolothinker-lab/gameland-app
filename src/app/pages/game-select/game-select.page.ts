import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
} from '@ionic/angular/standalone';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';

@Component({
  selector: 'app-game-select',
  templateUrl: './game-select.page.html',
  styleUrls: ['./game-select.page.scss'],
  standalone: true,
  imports: [IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, CommonModule],
})
export class GameSelectPage {
  constructor(private readonly router: Router, private readonly authSessionService: AuthSessionService) {}

  get username(): string {
    return this.authSessionService.currentUser.username;
  }

  goToTressetteLobby(): void {
    void this.router.navigateByUrl('/tressette-lobby');
  }

  logout(): void {
    this.authSessionService.logout();
    void this.router.navigateByUrl('/login');
  }
}
