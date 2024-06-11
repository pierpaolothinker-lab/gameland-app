import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonBadge, IonLabel,IonAvatar, IonChip, IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tressette4-inc',
  templateUrl: './tressette4-inc.page.html',
  styleUrls: ['./tressette4-inc.page.scss'],
  standalone: true,
  imports: [IonBadge, IonLabel, IonAvatar, IonChip, IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class Tressette4IncPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
