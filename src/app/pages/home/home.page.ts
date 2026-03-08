import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonCardContent, IonIcon, IonCardHeader, IonCardSubtitle, IonCard, IonList, IonItem, IonAvatar, IonLabel, IonButtons, IonMenuButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonIcon, IonCardHeader, IonCardSubtitle, IonCard, IonList, IonItem, IonAvatar, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton]
})
export class HomePage implements OnInit {

  constructor(private readonly router: Router) { }

  ngOnInit() {
    addIcons({ chevronForwardOutline });
  }

  goToTressetteLobby(): void {
    void this.router.navigateByUrl('/tressette-lobby');
  }
}
