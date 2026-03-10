import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DebugCardsCatalogPage } from './debug-cards-catalog.page';

describe('DebugCardsCatalogPage', () => {
  let component: DebugCardsCatalogPage;
  let fixture: ComponentFixture<DebugCardsCatalogPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugCardsCatalogPage, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DebugCardsCatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderizza 40 carte nel catalogo', () => {
    const cardsCount = component.rows.reduce((count, row) => count + row.cards.length, 0);
    expect(cardsCount).toBe(40);

    const cards = fixture.nativeElement.querySelectorAll('app-card-na');
    expect(cards.length).toBe(40);
  });

  it('mantiene ordine semi e valori deterministico', () => {
    const labels = Array.from(fixture.nativeElement.querySelectorAll('.catalog-label') as NodeListOf<HTMLElement>).map((el) =>
      (el.textContent ?? '').trim()
    );

    expect(labels[0]).toBe('denari-1');
    expect(labels[9]).toBe('denari-10');
    expect(labels[10]).toBe('spade-1');
    expect(labels[19]).toBe('spade-10');
    expect(labels[20]).toBe('coppe-1');
    expect(labels[29]).toBe('coppe-10');
    expect(labels[30]).toBe('bastoni-1');
    expect(labels[39]).toBe('bastoni-10');
  });
});
