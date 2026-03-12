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

  it('showCard non lancia errori con coordinate valide', () => {
    expect(() => component.showCard(0, 0)).not.toThrow();
  });

  it('ridimensiona lo sprite in base alla dimensione reale della carta', () => {
    const host = fixture.nativeElement as HTMLElement;
    spyOn(host, 'getBoundingClientRect').and.returnValue({
      width: 40,
      height: 72,
      top: 0,
      left: 0,
      right: 40,
      bottom: 72,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    component.showCard(0, 0);

    const [backgroundWidth, backgroundHeight] = host.style.backgroundSize.split(' ').map((value) => Number.parseFloat(value));

    expect(backgroundWidth).toBeGreaterThan(0);
    expect(backgroundHeight).toBeGreaterThan(0);
    expect(backgroundWidth).toBeLessThan(766);
    expect(backgroundHeight).toBeLessThan(505);
  });
});
