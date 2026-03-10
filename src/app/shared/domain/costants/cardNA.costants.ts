import { Injectable } from '@angular/core';

export @Injectable({ providedIn: 'root' })
class bGImageCostants {
  public CARD_SIZE = {
    ORIGINAL_WIDTH: 60,
    ORIGINAL_HEIGHT: 90,
  };

  public INITIAL_OFFSET = {
    X: 9,
    Y: 9,
  };

  public CARD_SPACING = {
    X: 5.2,
    Y: 24,
  };

  public SPRITE_SCALE = {
    X: 65 / 87,
    Y: 108 / 139,
  };

  public SAFE_INSET_PX = 1;
}
