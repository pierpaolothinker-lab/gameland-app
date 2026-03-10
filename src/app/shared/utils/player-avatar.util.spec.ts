import { DEFAULT_PLAYER_AVATAR_COUNT, DEFAULT_PLAYER_AVATARS, resolveDefaultPlayerAvatar } from './player-avatar.util';

describe('resolveDefaultPlayerAvatar', () => {
  it('espone set totale da 40 avatar default', () => {
    expect(DEFAULT_PLAYER_AVATAR_COUNT).toBe(40);
    expect(DEFAULT_PLAYER_AVATARS.length).toBe(40);
  });

  it('ritorna sempre lo stesso avatar per lo stesso username', () => {
    const first = resolveDefaultPlayerAvatar('Luca');
    const second = resolveDefaultPlayerAvatar('Luca');

    expect(first).toBe(second);
  });

  it('normalizza maiuscole/minuscole e spazi', () => {
    const first = resolveDefaultPlayerAvatar('  Marta  ');
    const second = resolveDefaultPlayerAvatar('marta');

    expect(first).toBe(second);
  });

  it('indice sempre in range [0..39] e file valido nel set', () => {
    const allowed = new Set(DEFAULT_PLAYER_AVATARS);
    const values = Array.from({ length: 400 }, (_, index) => resolveDefaultPlayerAvatar(`user-${index}`));

    for (const value of values) {
      expect(allowed.has(value)).toBeTrue();
    }
  });

  it('copre naming umano e animale nel catalogo', () => {
    const humanCount = DEFAULT_PLAYER_AVATARS.filter((entry) => /\/player-(0[1-9]|1[0-9]|20)\.svg$/.test(entry)).length;
    const animalCount = DEFAULT_PLAYER_AVATARS.filter((entry) => /\/animals\/animal-(0[1-9]|1[0-9]|20)\.svg$/.test(entry)).length;

    expect(humanCount).toBe(20);
    expect(animalCount).toBe(20);
  });

  it('usa fallback guest quando username non disponibile', () => {
    expect(resolveDefaultPlayerAvatar(undefined)).toBe(resolveDefaultPlayerAvatar('guest'));
    expect(resolveDefaultPlayerAvatar('')).toBe(resolveDefaultPlayerAvatar('guest'));
  });
});
