import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { CardIT10Component } from 'src/app/shared/ui/card-it10/card-it10.component';
import { Card3s7 } from 'src/app/shared/domain/models/card3s7.model';
import { CardNAComponent } from 'src/app/shared/ui/card-na/card-na.component';
import { CardIT, ICardIT, Suit } from 'src/app/shared/domain/models/cardIT.model';
import { CardPlayedAreaComponent } from 'src/app/shared/ui/card-played-area/card-played-area.component';

@Component({
  selector: 'app-table3s74i',
  templateUrl: './table3s74i.page.html',
  styleUrls: ['./table3s74i.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, CardIT10Component, CardNAComponent, CardPlayedAreaComponent]
})
export class Table3s74iPage implements OnInit {

  @ViewChild('playArea', { static: false }) playArea!: ElementRef;

  card!: ICardIT

  constructor() {
    // this.card = new CardIT(Suit.Bastoni, 10)
  }

  ngOnInit() {
    // this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // this.checkScreenSize();
  }

  ngAfterViewInit() {
    // this.checkScreenSize();
  }

  checkScreenSize() {
    // const screenWidth = window.innerWidth;
    // this.isSingleRowLayout = screenWidth > 768;  // Aggiorna il layout in base alla dimensione dello schermo
  }

  calculateOffset(cardElement: HTMLElement) {
    const playAreaRect = this.playArea.nativeElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();
    const deltaX = playAreaRect.left + (playAreaRect.width / 2) - (cardRect.left + (cardRect.width / 2));
    const deltaY = playAreaRect.top + (playAreaRect.height / 2) - (cardRect.top + (cardRect.height / 2));
    return { deltaX, deltaY }
  }
}
