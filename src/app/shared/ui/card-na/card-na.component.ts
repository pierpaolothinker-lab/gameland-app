import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { bGImageCostants } from './../../domain/costants/cardNA.costants'
import { ICardIT, Suit } from '../../domain/models/cardIT.model';

@Component({
  selector: 'app-card-na',
  templateUrl: './card-na.component.html',
  styleUrls: ['./card-na.component.scss'],
  standalone: true
})
export class CardNAComponent  implements OnInit {
  constructor(private myElement: ElementRef, private K : bGImageCostants) { }
  @Input({ required: true }) card!: ICardIT

  ngOnInit() {}

  ngAfterViewInit() {
    this.showCard(this.getMatrixRow(this.card), this.getMatrixCol(this.card)) 
  }

  private getMatrixRow(card: ICardIT): number {
    if (!card)
      throw new Error('No card')

    if (card.suit === Suit.Coppe)
      return 0

    if (card.suit === Suit.Denari)
      return 1

    if (card.suit === Suit.Bastoni)
      return 2

    if (card.suit === Suit.Spade)
      return 3

    return -1
  }

  private getMatrixCol(card: ICardIT): number {
    if (!card)
      throw new Error('No card')

    return this.card.value - 1

  }

  showCard(row: number, col: number) {

    // Calcola il fattore di ridimensionamento
    const scaleX = this.K.CARD_SIZE.DISPLAY_WIDTH / this.K.CARD_SIZE.ORIGINAL_WIDTH;
    const scaleY = this.K.CARD_SIZE.DISPLAY_HEIGHT / this.K.CARD_SIZE.ORIGINAL_HEIGHT;
  
    // Calcola la posizione della carta all'interno dell'immagine originale
    const xPosOriginal = this.K.INITIAL_OFFSET.X + col * (this.K.CARD_SIZE.ORIGINAL_WIDTH + this.K.CARD_SPACING.X);
    const yPosOriginal = this.K.INITIAL_OFFSET.Y + row * (this.K.CARD_SIZE.ORIGINAL_HEIGHT + this.K.CARD_SPACING.Y);
  
    // Applica il ridimensionamento
    const xPos = xPosOriginal * scaleX;
    const yPos = yPosOriginal * scaleY;

    this.myElement.nativeElement.style.backgroundPosition = `-${xPos}px -${yPos}px`; 
  }
}
