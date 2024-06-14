import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
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
    this.showCard(0,0) 
  }

  cards = ['Card1', 'Card2', 'Card3', 'Card4', 'Card5', 'Card6', 'Card7', 'Card8', 'Card9', 'Card10'];
  @ViewChild('playArea', { static: false }) playArea!: ElementRef;

  private previousCardElement: HTMLElement | null = null;
  private isAnimationEnabled: boolean = true;
  private selectedCardElement: HTMLElement | null = null;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  ngAfterViewInit() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const screenWidth = window.innerWidth;
    this.isAnimationEnabled = screenWidth <= 992;
  }

  
  playCard(event: Event, card: string) {
    const cardElement = event.target as HTMLElement;
    if (!cardElement) return;

    if (this.selectedCardElement && this.selectedCardElement !== cardElement) {
      // Reset the previously selected card if a new card is clicked
      this.selectedCardElement.style.transform = 'none';
      this.selectedCardElement.classList.remove('selected-card');
    }

    if (this.selectedCardElement === cardElement) {
      this.animateCardToCenter(cardElement);
      this.selectedCardElement = null; // Reset selected card
    } else {
      this.selectedCardElement = cardElement;
      cardElement.style.transform = 'scale(1.1)'; // Slightly enlarge the card
      cardElement.classList.add('selected-card');
    }
  }

  showCard(row: number, col: number) {
    console.log('init')
    const originalCardWidth = 87;
    const originalCardHeight = 139;
    const displayCardWidth = 60;
    const displayCardHeight = 90;
    
    const initialOffsetX = 10;
    const initialOffsetY = 11;
    const horizontalSpacing = 10;
    const verticalSpacing = 24;
  
    // Calcola il fattore di ridimensionamento
    const scaleX = displayCardWidth / originalCardWidth;
    const scaleY = displayCardHeight / originalCardHeight;
  
    // Calcola la posizione della carta all'interno dell'immagine originale
    const xPosOriginal = initialOffsetX + col * (originalCardWidth + horizontalSpacing);
    const yPosOriginal = initialOffsetY + row * (originalCardHeight + verticalSpacing);
  
    // Applica il ridimensionamento
    const xPos = xPosOriginal * scaleX;
    const yPos = yPosOriginal * scaleY;
  
    const cardElements = document.getElementsByClassName('card') 
    console.log('cardel', cardElements)
    if (cardElements) {
      console.log('cardElements', cardElements)
      // for (const card of cardElements){
      //   console.log(1)
      //   const cardh = card as HTMLElement
      //   console.log('n',card)
      //   console.log('h',cardh)
      //   cardh.style.backgroundPosition = `-${xPos}px -${yPos}px`;
      // }
      const test = Array.from(cardElements)
      console.log('test', test)

      for (let item of cardElements) {
        console.log('item',item)
      }
      Array.from(cardElements).forEach( card => {
           console.log(1)
        const cardh = card as HTMLElement
        console.log('n',card)
        console.log('h',cardh)
        cardh.style.backgroundPosition = `-${xPos}px -${yPos}px`;
      })
        
    }
  }

  onDoubleClick(event: Event, card: string) {
    const cardElement = event.target as HTMLElement;
    if (cardElement) {
      this.animateCardToCenter(cardElement);
      this.selectedCardElement = null; // Reset selected card
    }
  }

  animateCardToCenter(cardElement: HTMLElement) {
    const playAreaRect = this.playArea.nativeElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();

    if (!this.isAnimationEnabled) {
      // Sposta direttamente la carta al centro della play-area
      cardElement.style.transition = 'none';
      cardElement.style.transform = 'none';
      cardElement.style.left = `${playAreaRect.width / 2 - cardRect.width / 2}px`;
      cardElement.style.top = `${playAreaRect.height / 2 - cardRect.height / 2}px`;
      cardElement.classList.add('playing-card'); // Ensure the class is added
      this.playArea.nativeElement.appendChild(cardElement);

      // Rimuovi la carta precedente
      if (this.previousCardElement) {
        this.previousCardElement.remove();
      }
      this.previousCardElement = cardElement;
      return;
    }

    // Calcoliamo la posizione finale della carta rispetto alla play-area
    const deltaX = playAreaRect.left + (playAreaRect.width / 2) - (cardRect.left + (cardRect.width / 2));
    const deltaY = playAreaRect.top + (playAreaRect.height / 2) - (cardRect.top + (cardRect.height / 2));

    // Posizioniamo la carta inizialmente nella posizione corretta
    cardElement.style.left = `${cardRect.left}px`;
    cardElement.style.top = `${cardRect.top}px`;

    // Avviamo l'animazione
    requestAnimationFrame(() => {
      // Impostiamo la posizione finale della carta rispetto alla play-area
      cardElement.style.transition = 'transform 0.2s ease';
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
