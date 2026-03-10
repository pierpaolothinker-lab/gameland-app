const PLAYER_AVATAR_BASE_PATH = 'assets/avatars/players';
const PLAYER_ANIMAL_AVATAR_BASE_PATH = `${PLAYER_AVATAR_BASE_PATH}/animals`;

function buildAvatarFileList(basePath: string, prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const fileNumber = String(index + 1).padStart(2, '0');
    return `${basePath}/${prefix}-${fileNumber}.svg`;
  });
}

const HUMAN_PLAYER_AVATARS = buildAvatarFileList(PLAYER_AVATAR_BASE_PATH, 'player', 20);
const ANIMAL_PLAYER_AVATARS = buildAvatarFileList(PLAYER_ANIMAL_AVATAR_BASE_PATH, 'animal', 20);

export const DEFAULT_PLAYER_AVATARS: readonly string[] = [...HUMAN_PLAYER_AVATARS, ...ANIMAL_PLAYER_AVATARS];
export const DEFAULT_PLAYER_AVATAR_COUNT = DEFAULT_PLAYER_AVATARS.length;

export function resolveDefaultPlayerAvatar(username?: string | null, avatarCount = DEFAULT_PLAYER_AVATAR_COUNT): string {
  const safeCount = clampAvatarCount(avatarCount);
  const normalized = normalizeUsername(username);
  const avatarIndex = hashUsername(normalized) % safeCount;
  return DEFAULT_PLAYER_AVATARS[avatarIndex];
}

function clampAvatarCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_PLAYER_AVATAR_COUNT;
  }

  return Math.min(Math.floor(value), DEFAULT_PLAYER_AVATAR_COUNT);
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
