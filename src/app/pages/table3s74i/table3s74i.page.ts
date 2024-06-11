import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-table3s74i',
  templateUrl: './table3s74i.page.html',
  styleUrls: ['./table3s74i.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class Table3s74iPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  topRow = ['Card1', 'Card2', 'Card3', 'Card4', 'Card5'];
  bottomRow = ['Card6', 'Card7', 'Card8', 'Card9', 'Card10'];
  @ViewChild('playArea', { static: false }) playArea!: ElementRef;

  private previousCardElement: HTMLElement | null = null;

  playCard(event: Event, card: string) {
    const cardElement = event.target as HTMLElement;
    if (cardElement) {
      this.animateCardToCenter(cardElement);
    }
  }

  animateCardToCenter(cardElement: HTMLElement) {
    const playAreaRect = this.playArea.nativeElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();
  
    // Calcoliamo la posizione finale della carta rispetto alla play-area
    const deltaX = playAreaRect.left + (playAreaRect.width / 2) - (cardRect.left + (cardRect.width / 2));
    const deltaY = playAreaRect.top + (playAreaRect.height / 2) - (cardRect.top + (cardRect.height / 2));
  
    // Posizioniamo la carta inizialmente nella posizione corretta
    cardElement.style.left = `${cardRect.left}px`;
    cardElement.style.top = `${cardRect.top}px`;
  
    // Avviamo l'animazione
    requestAnimationFrame(() => {
      // Impostiamo la posizione finale della carta rispetto alla play-area
      cardElement.style.transition = 'transform 0.5s ease';
      cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });
  
    cardElement.classList.add('playing-card');
  
    cardElement.addEventListener('transitionend', () => {
      // Rimuoviamo la carta precedente dalla play-area
      if (this.previousCardElement) {
        this.previousCardElement.remove();
      }
  
      // Riposizioniamo la carta al centro della play-area
      cardElement.style.transition = 'none';
      cardElement.style.transform = 'none';
      cardElement.style.left = `${playAreaRect.width / 2 - cardRect.width / 2}px`;
      cardElement.style.top = `${playAreaRect.height / 2 - cardRect.height / 2}px`;
  
      this.playArea.nativeElement.appendChild(cardElement);
      this.previousCardElement = cardElement;
      cardElement.classList.remove('playing-card');
    }, { once: true });
  }
}  
