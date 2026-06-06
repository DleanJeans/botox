const API_BASE = 'https://www.botcscripts.com/api/scripts/';

export interface BotcScriptMeta {
  name: string;
  author?: string;
  [key: string]: unknown;
}

export interface BotcScriptResult {
  pk: number;
  script_id: number;
  name: string;
  version: string;
  script_type: string;
  author: string;
  content: Array<{ id: string; [key: string]: unknown }>;
  score: number;
}

export interface BotcScriptResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BotcScriptResult[];
}

/**
 * Search scripts from botcscripts.com.
 * @param query Search term (empty = recent/popular)
 * @param page Page number (default 1)
 */
export async function searchScripts(
  query: string,
  page: number = 1,
): Promise<BotcScriptResponse> {
  const params = new URLSearchParams();
  if (query.trim()) params.set('search', query.trim());
  if (page > 1) params.set('page', String(page));

  const url = params.toString()
    ? `${API_BASE}?${params.toString()}`
    : API_BASE;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Script search failed: ${res.status}`);
  return res.json();
}

/**
 * Extract role IDs from a script's content array (skip _meta entries).
 */
export function extractRoleIds(content: BotcScriptResult['content']): string[] {
  return content
    .filter(entry => entry.id !== '_meta' && !entry.id.startsWith('_'))
    .map(entry => entry.id);
}

/**
 * Get the meta info from a script's content.
 */
export function extractMeta(content: BotcScriptResult['content']): BotcScriptMeta | null {
  const meta = content.find(entry => entry.id === '_meta');
  if (!meta) return null;
  return {
    name: (meta as any).name || 'Unknown',
    author: (meta as any).author || '',
    ...meta,
  };
}

/**
 * Normalize role IDs from botcscripts format to our internal format.
 * botcscripts uses lowercase names without spaces/special chars.
 * Our role IDs may differ — this maps common ones.
 */
const ROLE_ID_MAP: Record<string, string> = {
  'fortuneteller': 'fortuneTeller',
  'fortune_teller': 'fortuneTeller',
  'fortune-teller': 'fortuneTeller',
  'snakecharmer': 'snakeCharmer',
  'snake_charmer': 'snakeCharmer',
  'towncrier': 'townCrier',
  'town_crier': 'townCrier',
  'flowergirl': 'flowerGirl',
  'flower_girl': 'flowerGirl',
  'tealady': 'teaLady',
  'tea_lady': 'teaLady',
  'tea lady': 'teaLady',
  'devilsadvocate': 'devilsAdvocate',
  'devils_advocate': 'devilsAdvocate',
  "devil's advocate": 'devilsAdvocate',
  'fanggu': 'fangGu',
  'fang_gu': 'fangGu',
  'nodashii': 'noDashii',
  'no_dashii': 'noDashii',
  'no-dashii': 'noDashii',
  'pithag': 'pithag',
  'vigormortis': 'vigormortis',
  'lordoftyphon': 'lordOfTyphon',
  'lord_of_typhon': 'lordOfTyphon',
  'alhadikhia': 'alHadikhia',
  'al-hadikhia': 'alHadikhia',
  'al_hadikhia': 'alHadikhia',
  'eviltwin': 'evilTwin',
  'evil_twin': 'evilTwin',
  'boomdandy': 'boomDandy',
  'mastermind': 'mastermind',
  'poppygrower': 'poppyGrower',
  'poppy_grower': 'poppyGrower',
  'bountyhunter': 'bountyHunter',
  'bounty_hunter': 'bountyHunter',
  'nightwatchman': 'nightWatchman',
  'night_watchman': 'nightWatchman',
  'choirboy': 'choirBoy',
  'choir_boy': 'choirBoy',
  'puzzlemaster': 'puzzleMaster',
  'puzzle_master': 'puzzleMaster',
  'plaguedoctor': 'plagueDoctor',
  'plague_doctor': 'plagueDoctor',
  'highpriestess': 'highPriestess',
  'high_priestess': 'highPriestess',
};

export function normalizeRoleId(botcId: string): string {
  const lower = botcId.toLowerCase().replace(/[^a-z]/g, '');
  return ROLE_ID_MAP[lower] || ROLE_ID_MAP[botcId.toLowerCase()] || botcId;
}
