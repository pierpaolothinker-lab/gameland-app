import { Component, ElementRef, OnInit } from '@angular/core';
import { bGImageCostants } from './../../domain/costants/cardNA.costants'

@Component({
  selector: 'app-card-na',
  templateUrl: './card-na.component.html',
  styleUrls: ['./card-na.component.scss'],
  standalone: true
})
export class CardNAComponent  implements OnInit {
  constructor(private myElement: ElementRef, private K : bGImageCostants) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.showCard(0,2) 
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
