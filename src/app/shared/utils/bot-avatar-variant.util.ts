export function resolveBotAvatarVariantClass(seedParts: Array<string | undefined | null>, variants = 6): string {
  const safeVariants = Number.isFinite(variants) && variants > 0 ? Math.floor(variants) : 6;
  const seed = seedParts.map((part) => part ?? '-').join('|');

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }

  const variant = Math.abs(hash) % safeVariants;
  return `bot-variant-${variant}`;
}

