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
  content: Array<{
    id: string;
    [key: string]: unknown;
  }>;
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

  const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;

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
export function extractMeta(
  content: BotcScriptResult['content'],
): BotcScriptMeta | null {
  const meta = content.find(entry => entry.id === '_meta');
  if (!meta) return null;
  return {
    name: (meta as any).name || 'Unknown',
    author: (meta as any).author || '',
    ...meta,
  };
}

export function normalizeRoleId(botcId: string): string {
  // Our internal IDs are lowercase concatenated: fortuneteller, snakecharmer, etc.
  // botcscripts may use snake_case, kebab-case, spaces, or camelCase.
  // Strip all non-alpha characters and lowercase.
  return botcId.replace(/[^a-zA-Z]/g, '').toLowerCase();
}
