import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent } from '@ionic/angular/standalone';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, CommonModule],
})
export class ProfilePage {
  constructor(private readonly authSessionService: AuthSessionService, private readonly router: Router) {}

  get username(): string {
    return this.authSessionService.currentUser.username;
  }

  logout(): void {
    this.authSessionService.logout();
    void this.router.navigateByUrl('/login');
  }
}
