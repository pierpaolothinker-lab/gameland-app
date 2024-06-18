import { Injectable } from '@angular/core';
import { DeckIT } from 'src/app/shared/domain/models/deckIT.model';

@Injectable({
  providedIn: 'root'
})
export class DeckITService {

  private deck: DeckIT = new DeckIT()
  constructor() { 
    this.deck.shuffle()
  }

  getPlayerCards() {
    return this.deck.getCardSlice(1,10);
  }
}
