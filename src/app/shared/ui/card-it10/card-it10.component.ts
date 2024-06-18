import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICardIT } from '../../domain/models/cardIT.model';
import { AnimationController, IonCol, IonGrid, IonRow } from '@ionic/angular/standalone';
import { CardNAComponent } from '../card-na/card-na.component';
import { DeckITService } from 'src/app/services/fakes/deck-it.service';
import { Table3s74iPage } from 'src/app/pages/table3s74i/table3s74i.page';

@Component({
  selector: 'app-card-it10',
  templateUrl: './card-it10.component.html',
  styleUrls: ['./card-it10.component.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, CardNAComponent, CommonModule]
})
export class CardIT10Component implements OnInit {

  @Output() onPlayedCard = new EventEmitter<ICardIT>()

  cards: ICardIT[] = [];
  private selectedCardElement: HTMLElement | null = null;

  constructor(private animationCtrl: AnimationController, private _deckService: DeckITService,
    private tableComponent: Table3s74iPage
  ) { }

  ngOnInit() {
    this.cards = this._deckService.getPlayerCards()
  }

  playCard(event: Event, card: ICardIT) {
    const cardElement = event.target as HTMLElement;
    if (!cardElement) return;

    if (this.selectedCardElement && this.selectedCardElement !== cardElement) {
      // Reset the previously selected card if a new card is clicked
      this.selectedCardElement.style.transform = 'none';
    }

    if (this.selectedCardElement === cardElement) {
      const offset = this.tableComponent.calculateOffset(cardElement)
      this.animationCtrl.create('animation')
        .addElement(cardElement)
        .duration(200)
        .keyframes([{ offset: 1, transform: `translate(${offset.deltaX}px, ${offset.deltaY}px)` }])
        .play()
        .then(() => { this.selectedCardElement!.classList.add('card-hide') })
      this.onPlayedCard.emit(card)
    } else {
      this.selectedCardElement = cardElement;
      cardElement.style.transform = 'scale(1.1)'; // Slightly enlarge the card
    }
  }
}
