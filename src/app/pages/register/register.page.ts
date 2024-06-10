import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonIcon, IonButton, IonItem, IonInput } from '@ionic/angular/standalone';

import {addIcons} from "ionicons";
import { lockClosed, eye } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonIcon, IonButton, IonItem, IonInput]
})
export class RegisterPage implements OnInit {

  constructor() { }

  ngOnInit() {
    addIcons({ lockClosed, eye });
  }

}
