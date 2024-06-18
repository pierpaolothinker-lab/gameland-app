import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, AnimationController, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { CardNAComponent } from 'src/app/shared/ui/card-na/card-na.component';
import { DeckITService } from 'src/app/services/fakes/deck-it.service';
import { ICardIT } from 'src/app/shared/domain/models/cardIT.model';
import { CardIT10Component } from 'src/app/shared/ui/card-it10/card-it10.component';

@Component({
  selector: 'app-table3s74i',
  templateUrl: './table3s74i.page.html',
  styleUrls: ['./table3s74i.page.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, CardNAComponent, CardIT10Component]
})
export class Table3s74iPage implements OnInit {
  isSingleRowLayout: boolean = true;
  cards: ICardIT[] = [];
  @ViewChild('playArea', { static: false }) playArea!: ElementRef;

  private previousCardElement: HTMLElement | null = null;
  private selectedCardElement: HTMLElement | null = null;

  constructor(private animationCtrl: AnimationController, private deckService: DeckITService) { 
    this.cards = deckService.getPlayerCards()
    console.log("CARTE", this.cards)
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  ngAfterViewInit() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const screenWidth = window.innerWidth;
    this.isSingleRowLayout = screenWidth > 768;  // Aggiorna il layout in base alla dimensione dello schermo
  }

  playCard(event: Event, card: ICardIT) {
    const cardElement = event.target as HTMLElement;
    if (!cardElement) return;

    if (this.selectedCardElement && this.selectedCardElement !== cardElement) {
      // Reset the previously selected card if a new card is clicked
      this.selectedCardElement.style.transform = 'none';
      this.selectedCardElement.classList.remove('selected-card');
    }

    if (this.selectedCardElement === cardElement) {
      const offset = this.calculateOffset(cardElement)
      this.animationCtrl.create('animation')
        .addElement(cardElement)
        .duration(200)
        .keyframes([{ offset: 1, transform:  `translate(${offset.deltaX}px, ${offset.deltaY}px)` }])
        .play()
      // this.animateCardToCenter(cardElement)
      this.completeTransaction(cardElement)
      // this.selectedCardElement = null; // Reset selected card
    } else {
      this.selectedCardElement = cardElement;
      cardElement.style.transform = 'scale(1.1)'; // Slightly enlarge the card
      cardElement.classList.add('selected-card');
    }
  }

  // onDoubleClick(event: Event, card: string) {
  //   const cardElement = event.target as HTMLElement;
  //   console.log('ECCHIME')
  //   if (cardElement) {
  //     this.animateCardToCenter(cardElement);
  //     this.selectedCardElement = null; // Reset selected card
  //   }
  // }

  completeTransaction(cardElement: HTMLElement){
    // cardElement.classList.add('playing-card');

    cardElement.addEventListener('transitionend', () => {
      // // Rimuoviamo la carta precedente dalla play-area
      // if (this.previousCardElement) {
      //   this.previousCardElement.remove();
      // }

      // // Riposizioniamo la carta al centro della play-area
      // // cardElement.style.transition = 'none';
      // // cardElement.style.transform = 'none';
      // // cardElement.style.left = `${playAreaRect.width / 2 - cardRect.width / 2}px`;
      // // cardElement.style.top = `${playAreaRect.height / 2 - cardRect.height / 2}px`;

      this.playArea.nativeElement.appendChild(cardElement);
      // this.previousCardElement = cardElement;
      // cardElement.classList.remove('playing-card');
    })
  }

  // animateCardToCenter(cardElement: HTMLElement) {
  //   const playAreaRect = this.playArea.nativeElement.getBoundingClientRect();
  //   const cardRect = cardElement.getBoundingClientRect();
  //   const menuOffset = this.getMenuOffset(); // Ottieni l'offset del menu

  //   if (!this.isAnimationEnabled) {
  //     // Sposta direttamente la carta al centro della play-area
  //     cardElement.style.transition = 'none';
  //     cardElement.style.transform = 'none';
  //     cardElement.style.left = `${playAreaRect.width / 2 - cardRect.width / 2}px`;
  //     cardElement.style.top = `${playAreaRect.height / 2 - cardRect.height / 2}px`;
  //     cardElement.classList.add('playing-card'); // Ensure the class is added
  //     this.playArea.nativeElement.appendChild(cardElement);

  //     // Rimuovi la carta precedente
  //     if (this.previousCardElement) {
  //       this.previousCardElement.remove();
  //     }
  //     this.previousCardElement = cardElement;
  //     return;
  //   }

  //   // Calcoliamo la posizione finale della carta rispetto alla play-area
  //   const deltaX = playAreaRect.left + (playAreaRect.width / 2) - (cardRect.left + (cardRect.width / 2));
  //   const deltaY = playAreaRect.top + (playAreaRect.height / 2) - (cardRect.top + (cardRect.height / 2));

  //   // Posizioniamo la carta inizialmente nella posizione corretta
  //   // cardElement.style.left = `${cardRect.left - menuOffset}px`;
  //   // cardElement.style.top = `${cardRect.top}px`;

  //   const loadingAnimation = this.animationCtrl.create('animation')
  //     .addElement(cardElement)
  //     .duration(200)
  //     .keyframes([
  //       { offset: 1, transform:  `translate(${deltaX}px, ${deltaY}px)` },
  //       // { offset: 0.5, transform: 'scale(1.2)' },
  //       // { offset: 0.8, transform: 'scale(0.9)' },
  //       // { offset: 1, transform: 'scale(1)' }
  //     ]);

  //     loadingAnimation.play()
  //   // Avviamo l'animazione
  //   // requestAnimationFrame(() => {
  //   //   // Impostiamo la posizione finale della carta rispetto alla play-area
  //   //   cardElement.style.transition = 'transform 0.2s ease';
  //   //   cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  //   // });    

  //   cardElement.classList.add('playing-card');

  //   cardElement.addEventListener('transitionend', () => {
  //     // Rimuoviamo la carta precedente dalla play-area
  //     if (this.previousCardElement) {
  //       this.previousCardElement.remove();
  //     }

  //     // Riposizioniamo la carta al centro della play-area
  //     cardElement.style.transition = 'none';
  //     cardElement.style.transform = 'none';
  //     cardElement.style.left = `${playAreaRect.width / 2 - cardRect.width / 2}px`;
  //     cardElement.style.top = `${playAreaRect.height / 2 - cardRect.height / 2}px`;

  //     this.playArea.nativeElement.appendChild(cardElement);
  //     this.previousCardElement = cardElement;
  //     cardElement.classList.remove('playing-card');
  //   }, { once: true });
  // }

  getMenuOffset(): number {
    // Calcola l'offset del menu se presente
    const menuElement = document.querySelector('.menu-class'); // Sostituisci con il selettore corretto del tuo menu
    if (menuElement) {
      const menuRect = menuElement.getBoundingClientRect();
      return menuRect.width;
    }
    return 0;
  }

  calculateOffset(cardElement: HTMLElement) {
    const playAreaRect = this.playArea.nativeElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();
    const deltaX = playAreaRect.left + (playAreaRect.width / 2) - (cardRect.left + (cardRect.width / 2));
    const deltaY = playAreaRect.top + (playAreaRect.height / 2) - (cardRect.top + (cardRect.height / 2));
    return{deltaX, deltaY}

  }
}
