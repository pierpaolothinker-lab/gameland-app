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

    return card.value - 1;
  }

  showCard(row: number, col: number): void {
    const grid = this.K.CARD_GRID;
    const display = this.K.DISPLAY;

    const scaleX = display.WIDTH / grid.CELL_WIDTH;
    const scaleY = display.HEIGHT / grid.CELL_HEIGHT;

    const xCell = grid.OFFSET_X + col * (grid.CELL_WIDTH + grid.GAP_X);
    const yCell = grid.OFFSET_Y + row * (grid.CELL_HEIGHT + grid.GAP_Y);

    const xPos = Math.round(xCell * scaleX) + display.SAFE_INSET;
    const yPos = Math.round(yCell * scaleY) + display.SAFE_INSET;

    const bgWidth = Math.round(this.K.SPRITE_SHEET.WIDTH * scaleX);
    const bgHeight = Math.round(this.K.SPRITE_SHEET.HEIGHT * scaleY);

    const elementStyle = this.myElement.nativeElement.style;
    elementStyle.backgroundSize = `${bgWidth}px ${bgHeight}px`;
    elementStyle.backgroundPosition = `-${xPos}px -${yPos}px`;
  }
}
