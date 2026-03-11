import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, CommonModule],
})
export class ChatPage {
  readonly channels = [
    { title: 'Chat tavolo', subtitle: 'Contesto partita e coordinamento rapido', badge: 'Live' },
    { title: 'Chat team', subtitle: 'Spazio dedicato per compagni e strategie leggere', badge: 'Soon' },
    { title: 'Community', subtitle: 'Annunci, supporto e aggiornamenti di piattaforma', badge: 'Soon' },
  ];
}
