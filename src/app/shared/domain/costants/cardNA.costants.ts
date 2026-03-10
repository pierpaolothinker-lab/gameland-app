import { Injectable } from '@angular/core';

export @Injectable({ providedIn: 'root' })
class bGImageCostants {
  public SPRITE_SHEET = {
    WIDTH: 1024,
    HEIGHT: 649,
  };

  public CARD_GRID = {
    OFFSET_X: 9,
    OFFSET_Y: 9,
    CELL_WIDTH: 60,
    CELL_HEIGHT: 90,
    GAP_X: 5,
    GAP_Y: 24,
  };

  public DISPLAY = {
    WIDTH: 58,
    HEIGHT: 105,
    SAFE_INSET: 1,
  };
}
