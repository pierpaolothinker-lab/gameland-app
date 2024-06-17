import { TestBed } from '@angular/core/testing';

import { DeckITService } from './deck-it.service';

describe('DeckITServiceService', () => {
  let service: DeckITService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeckITService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
