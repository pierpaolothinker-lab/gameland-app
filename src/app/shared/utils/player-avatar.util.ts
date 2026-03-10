const PLAYER_AVATAR_BASE_PATH = 'assets/avatars/players';
const DEFAULT_PLAYER_AVATAR_COUNT = 20;

export function resolveDefaultPlayerAvatar(username?: string | null, avatarCount = DEFAULT_PLAYER_AVATAR_COUNT): string {
  const safeCount = Number.isFinite(avatarCount) && avatarCount > 0 ? Math.floor(avatarCount) : DEFAULT_PLAYER_AVATAR_COUNT;
  const normalized = normalizeUsername(username);
  const avatarIndex = hashUsername(normalized) % safeCount;
  const fileNumber = String(avatarIndex + 1).padStart(2, '0');
  return `${PLAYER_AVATAR_BASE_PATH}/player-${fileNumber}.svg`;
}

function normalizeUsername(username?: string | null): string {
  return (username ?? '').trim().toLowerCase() || 'guest';
}

function hashUsername(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
  }

  return Math.abs(hash);
}
