import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    CommonModule,
    FormsModule,
  ],
})
export class LoginPage implements OnInit {
  username = '';
  password = '';
  submitted = false;

  constructor(private readonly authSessionService: AuthSessionService, private readonly router: Router) {}

  ngOnInit(): void {
    if (this.authSessionService.hasActiveSession) {
      void this.router.navigateByUrl('/game-select');
    }
  }

  get usernameErrorVisible(): boolean {
    return this.submitted && !this.username.trim();
  }

  onSubmit(): void {
    this.submitted = true;

    const success = this.authSessionService.loginWithUsername(this.username);
    if (!success) {
      return;
    }

    void this.router.navigateByUrl('/game-select');
  }
}
