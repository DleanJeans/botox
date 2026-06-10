import type { Script } from '../types';
import { getDynamicRoles } from './roleIcons';

// ── Static fallback scripts ──
const STATIC_SCRIPTS: Script[] = [
  {
    id: 'tb',
    name: 'Trouble Brewing',
    roles: [
      'washerwoman',
      'librarian',
      'investigator',
      'chef',
      'empath',
      'fortuneTeller',
      'undertaker',
      'monk',
      'soldier',
      'ravenkeeper',
      'virgin',
      'slayer',
      'mayor',
      'drunk',
      'recluse',
      'saint',
      'butler',
      'poisoner',
      'spy',
      'scarletWoman',
      'baron',
      'imp',
    ],
  },
  {
    id: 'bmr',
    name: 'Bad Moon Rising',
    roles: [
      'grandmother',
      'sailor',
      'chambermaid',
      'exorcist',
      'innkeeper',
      'gambler',
      'gossip',
      'courtier',
      'professor',
      'minstrel',
      'teaLady',
      'pacifist',
      'fool',
      'tinker',
      'moonchild',
      'godfather',
      'assassin',
      'devilsAdvocate',
      'mastermind',
      'zombuul',
      'shabaloth',
      'po',
    ],
  },
  {
    id: 'snv',
    name: 'Sects & Violets',
    roles: [
      'dreamer',
      'snakeCharmer',
      'mathematician',
      'flowerGirl',
      'townCrier',
      'oracle',
      'savant',
      'seamstress',
      'philosopher',
      'artist',
      'juggler',
      'sage',
      'mutant',
      'sweetheart',
      'barber',
      'klutz',
      'evilTwin',
      'witch',
      'cerenovus',
      'pithag',
      'fangGu',
      'vigormortis',
      'noDashii',
      'vortex',
    ],
  },
];

const EDITION_NAMES: Record<string, string> = {
  tb: 'Trouble Brewing',
  bmr: 'Bad Moon Rising',
  snv: 'Sects & Violets',
  carousel: 'Carousel',
};

/**
 * Build scripts dynamically from the roles fetched via preloadRoleData.
 * Groups roles by their `edition` field.
 */
function buildDynamicScripts(): Script[] {
  const roles = getDynamicRoles();
  if (roles.length === 0) return STATIC_SCRIPTS;

  const editions = new Map<
    string,
    {
      name: string;
      roles: string[];
    }
  >();

  for (const role of roles) {
    const edition = role.edition || 'tb';
    if (!editions.has(edition)) {
      editions.set(edition, {
        name:
          EDITION_NAMES[edition] ||
          edition.charAt(0).toUpperCase() + edition.slice(1),
        roles: [],
      });
    }
    editions.get(edition)?.roles.push(role.id);
  }

  // Convert to array, put core editions first
  const order = [
    'tb',
    'bmr',
    'snv',
    'carousel',
  ];
  const result: Script[] = [];

  for (const id of order) {
    if (editions.has(id)) {
      const e = editions.get(id)!;
      result.push({
        id,
        name: e.name,
        roles: e.roles,
      });
      editions.delete(id);
    }
  }
  // Remaining (custom/unexpected editions)
  for (const [id, e] of editions) {
    result.push({
      id,
      name: e.name,
      roles: e.roles,
    });
  }

  return result;
}

/**
 * Returns scripts — dynamically built from API data when available,
 * falls back to static scripts.
 */
export function getScripts(): Script[] {
  return buildDynamicScripts();
}

/**
 * Legacy static export for components that import SCRIPTS directly.
 * Components should ideally use getScripts() for dynamic data,
 * but this constant provides a snapshot at import time.
 *
 * For live dynamic data, use getScripts() instead.
 */
export const SCRIPTS: Script[] = STATIC_SCRIPTS;

export function getScriptRoles(scriptId: string): string[] {
  const scripts = getScripts();
  const script = scripts.find(s => s.id === scriptId);
  return script?.roles ?? [];
}
