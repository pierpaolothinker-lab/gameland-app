import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardPlayedAreaComponent } from './card-played-area.component';

describe('CardPlayedAreaComponent', () => {
  let component: CardPlayedAreaComponent;
  let fixture: ComponentFixture<CardPlayedAreaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CardPlayedAreaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardPlayedAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
