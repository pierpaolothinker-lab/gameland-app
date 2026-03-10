import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

import { CardIT, Suit } from 'src/app/shared/domain/models/cardIT.model';
import { CardNAComponent } from 'src/app/shared/ui/card-na/card-na.component';

interface CatalogRow {
  label: string;
  suit: Suit;
  cards: CardIT[];
}

@Component({
  selector: 'app-debug-cards-catalog',
  templateUrl: './debug-cards-catalog.page.html',
  styleUrls: ['./debug-cards-catalog.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonButton, IonContent, CardNAComponent],
})
export class DebugCardsCatalogPage {
  readonly values: number[] = Array.from({ length: 10 }, (_, index) => index + 1);

  readonly rows: CatalogRow[] = [
    this.buildRow('denari', Suit.Denari),
    this.buildRow('spade', Suit.Spade),
    this.buildRow('coppe', Suit.Coppe),
    this.buildRow('bastoni', Suit.Bastoni),
  ];

  trackByRow(_: number, row: CatalogRow): string {
    return row.label;
  }

  trackByCardValue(_: number, card: CardIT): number {
    return card.value;
  }

  private buildRow(label: string, suit: Suit): CatalogRow {
    return {
      label,
      suit,
      cards: this.values.map((value) => new CardIT(suit, value)),
    };
  }
}



