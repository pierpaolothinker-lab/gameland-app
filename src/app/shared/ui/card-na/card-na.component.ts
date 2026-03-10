import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { bGImageCostants } from './../../domain/costants/cardNA.costants';
import { ICardIT, Suit } from '../../domain/models/cardIT.model';

@Component({
  selector: 'app-card-na',
  templateUrl: './card-na.component.html',
  styleUrls: ['./card-na.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CardNAComponent implements OnInit {
  constructor(private myElement: ElementRef, private K: bGImageCostants) {}

  @Input({ required: true }) card!: ICardIT;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.showCard(this.getMatrixRow(this.card), this.getMatrixCol(this.card));
  }

  private getMatrixRow(card: ICardIT): number {
    if (!card) {
      throw new Error('No card');
    }

    if (card.suit === Suit.Coppe) {
      return 0;
    }

    if (card.suit === Suit.Denari) {
      return 1;
    }

    if (card.suit === Suit.Bastoni) {
      return 2;
    }

    if (card.suit === Suit.Spade) {
      return 3;
    }

    return -1;
  }

  private getMatrixCol(card: ICardIT): number {
    if (!card) {
      throw new Error('No card');
    }

    return this.card.value - 1;
  }

  private alignHalfPixel(value: number): number {
    return Math.round(value * 2) / 2;
  }

  private getFineTuneOffsets(card: ICardIT): { x: number; y: number; bottomCropY: number } {
    const valueOffsetX = card.value === 6 ? 4 : card.value === 5 ? 2 : card.value === 4 ? 1 : 0;
    const bastoniOffsetY = card.suit === Suit.Bastoni ? 1 : 0;
    const bastoniBottomCropY = card.suit === Suit.Bastoni ? 2 : 0;
    return { x: valueOffsetX, y: bastoniOffsetY, bottomCropY: bastoniBottomCropY };
  }

  showCard(row: number, col: number): void {
    const scaleX = this.K.CARD_SIZE.DISPLAY_WIDTH / this.K.CARD_SIZE.ORIGINAL_WIDTH;
    const scaleY = this.K.CARD_SIZE.DISPLAY_HEIGHT / this.K.CARD_SIZE.ORIGINAL_HEIGHT;

    const xPosOriginal = this.K.INITIAL_OFFSET.X + col * (this.K.CARD_SIZE.ORIGINAL_WIDTH + this.K.CARD_SPACING.X);
    const yPosOriginal = this.K.INITIAL_OFFSET.Y + row * (this.K.CARD_SIZE.ORIGINAL_HEIGHT + this.K.CARD_SPACING.Y);

    // Keep base mapping intact; apply only micro fine-tune for known edge cards.
    const xPos = this.alignHalfPixel(xPosOriginal * scaleX);
    const yPos = this.alignHalfPixel(yPosOriginal * scaleY);
    const offset = this.getFineTuneOffsets(this.card);

    this.myElement.nativeElement.style.backgroundPosition = `-${xPos - offset.x}px -${yPos + offset.y + offset.bottomCropY}px`;
  }
}

