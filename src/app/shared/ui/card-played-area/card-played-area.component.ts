import { Component, Input, OnInit } from '@angular/core';
import { CardNAComponent } from '../card-na/card-na.component';
import { ICardIT } from '../../domain/models/cardIT.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-played-area',
  templateUrl: './card-played-area.component.html',
  styleUrls: ['./card-played-area.component.scss'],
  imports: [CardNAComponent, CommonModule],
  standalone: true
})
export class CardPlayedAreaComponent  implements OnInit {

  @Input() playedCard!: ICardIT

  constructor() { }

  ngOnInit() {}
}
