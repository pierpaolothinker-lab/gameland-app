import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import {addIcons} from "ionicons";
import { heart, lockClosed, eye } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonImg, IonList, IonIcon, IonButton, IonItem, IonInput, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardTitle, IonCardHeader],
})
export class LoginPage implements OnInit {

  constructor() { }

  ngOnInit() {
    addIcons({ heart, lockClosed, eye });
  }

}
