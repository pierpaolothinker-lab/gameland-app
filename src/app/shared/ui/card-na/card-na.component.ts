import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { bGImageCostants } from './../../domain/costants/cardNA.costants';
import { ICardIT, Suit } from '../../domain/models/cardIT.model';

@Component({
  selector: 'app-card-na',
  templateUrl: './card-na.component.html',
  styleUrls: ['./card-na.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CardNAComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly referenceHostWidth = 58;
  private readonly referenceHostHeight = 105;
  private readonly referenceSpriteWidth = 1024 * (65 / 87);
  private readonly referenceSpriteHeight = 649 * (108 / 139);
  private resizeObserver?: ResizeObserver;

  constructor(private myElement: ElementRef, private K: bGImageCostants) {}

  @Input({ required: true }) card!: ICardIT;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['card']) {
      this.syncSpriteRender();
    }
  }

  ngAfterViewInit(): void {
    this.syncSpriteRender();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.syncSpriteRender();
    });
    this.resizeObserver.observe(this.hostElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
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

  private getFineTuneOffsets(card: ICardIT): { x: number; y: number; topCropY: number; bottomCropY: number } {
    const valueOffsetX = card.value === 6 ? 4 : card.value === 5 ? 2 : card.value === 4 ? 1 : 0;
    const bastoniOffsetY = card.suit === Suit.Bastoni ? -1 : 0;
    const bastoniTopCropY = card.suit === Suit.Bastoni ? 2 : 0;
    const bastoniBottomCropY = 0;
    return { x: valueOffsetX, y: bastoniOffsetY, topCropY: bastoniTopCropY, bottomCropY: bastoniBottomCropY };
  }

  private get hostElement(): HTMLElement {
    return this.myElement.nativeElement as HTMLElement;
  }

  private syncSpriteRender(): void {
    if (!this.card) {
      return;
    }

    this.showCard(this.getMatrixRow(this.card), this.getMatrixCol(this.card));
  }

  private resolveHostSize(): { width: number; height: number } {
    const rect = this.hostElement.getBoundingClientRect();
    const computedStyle = getComputedStyle(this.hostElement);
    const computedWidth = Number.parseFloat(computedStyle.width);
    const computedHeight = Number.parseFloat(computedStyle.height);

    return {
      width: rect.width || computedWidth || this.referenceHostWidth,
      height: rect.height || computedHeight || this.referenceHostHeight,
    };
  }

  showCard(row: number, col: number): void {
    const { width, height } = this.resolveHostSize();
    const hostScaleX = width / this.referenceHostWidth;
    const hostScaleY = height / this.referenceHostHeight;
    const spriteScaleX = this.K.CARD_SIZE.DISPLAY_WIDTH / this.K.CARD_SIZE.ORIGINAL_WIDTH;
    const spriteScaleY = this.K.CARD_SIZE.DISPLAY_HEIGHT / this.K.CARD_SIZE.ORIGINAL_HEIGHT;

    const xPosOriginal = this.K.INITIAL_OFFSET.X + col * (this.K.CARD_SIZE.ORIGINAL_WIDTH + this.K.CARD_SPACING.X);
    const yPosOriginal = this.K.INITIAL_OFFSET.Y + row * (this.K.CARD_SIZE.ORIGINAL_HEIGHT + this.K.CARD_SPACING.Y);

    // Keep base mapping intact; apply only micro fine-tune for known edge cards.
    const xPos = this.alignHalfPixel(xPosOriginal * spriteScaleX);
    const yPos = this.alignHalfPixel(yPosOriginal * spriteScaleY);
    const offset = this.getFineTuneOffsets(this.card);
    const spriteWidth = this.alignHalfPixel(this.referenceSpriteWidth * hostScaleX);
    const spriteHeight = this.alignHalfPixel(this.referenceSpriteHeight * hostScaleY);
    const bgPosX = this.alignHalfPixel((xPos - offset.x) * hostScaleX);
    const bgPosY = this.alignHalfPixel((yPos + offset.y + offset.topCropY + offset.bottomCropY) * hostScaleY);

    this.hostElement.style.backgroundSize = `${spriteWidth}px ${spriteHeight}px`;
    this.hostElement.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`;
  }
}





