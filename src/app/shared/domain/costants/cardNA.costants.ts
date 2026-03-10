import { Injectable } from '@angular/core';

export @Injectable({ providedIn: 'root' })
class bGImageCostants {
  public CARD_SIZE = {
    ORIGINAL_WIDTH: 60,
    ORIGINAL_HEIGHT: 90,
    DISPLAY_WIDTH: 70,
    DISPLAY_HEIGHT: 100,
  };

  public INITIAL_OFFSET = {
    X: 9,
    Y: 9,
  };

  public CARD_SPACING = {
    X: 5.2,
    Y: 24,
  };
}
