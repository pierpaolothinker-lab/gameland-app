import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardNAComponent } from './card-na.component';

describe('CardNAComponent', () => {
  let component: CardNAComponent;
  let fixture: ComponentFixture<CardNAComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CardNAComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardNAComponent);
    component = fixture.componentInstance;
    component.card = { suit: 0, value: 1 };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
