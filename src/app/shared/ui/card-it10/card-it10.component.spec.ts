import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AnimationController } from '@ionic/angular/standalone';

import { CardIT10Component } from './card-it10.component';
import { DeckITService } from 'src/app/services/fakes/deck-it.service';
import { Table3s74iPage } from 'src/app/pages/table3s74i/table3s74i.page';

describe('CardIT10Component', () => {
  let component: CardIT10Component;
  let fixture: ComponentFixture<CardIT10Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CardIT10Component],
      providers: [
        AnimationController,
        DeckITService,
        {
          provide: Table3s74iPage,
          useValue: {
            calculateOffset: () => ({ deltaX: 0, deltaY: 0 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardIT10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
