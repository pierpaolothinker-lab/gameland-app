import { resolveDefaultPlayerAvatar } from './player-avatar.util';

describe('resolveDefaultPlayerAvatar', () => {
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

  it('distribuisce gli avatar nel range player-01..player-20', () => {
    const values = Array.from({ length: 200 }, (_, index) => resolveDefaultPlayerAvatar(`user-${index}`));

    for (const value of values) {
      expect(value).toMatch(/^assets\/avatars\/players\/player-(0[1-9]|1[0-9]|20)\.svg$/);
    }
  });

  it('usa fallback guest quando username non disponibile', () => {
    expect(resolveDefaultPlayerAvatar(undefined)).toBe(resolveDefaultPlayerAvatar('guest'));
    expect(resolveDefaultPlayerAvatar('')).toBe(resolveDefaultPlayerAvatar('guest'));
  });
});
