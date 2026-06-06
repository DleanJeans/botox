import { Role, Team } from '../types';
import { getDynamicRoles } from './roleIcons';

// ── Minimal fallback roles (only used when API data hasn't loaded) ──
const FALLBACK_ROLES: Record<string, Role> = {};

const TEAM_EMOJI: Record<string, string> = {
  townsfolk: '👤', outsider: '❓', minion: '👹', demon: '😈', fabled: '⭐', traveller: '🧳',
};

function apiRoleToInternal(apiRole: any): Role {
  const team = (apiRole.team || 'townsfolk') as Team;
  return {
    id: apiRole.id,
    name: apiRole.name,
    team,
    ability: apiRole.ability || '',
    emoji: TEAM_EMOJI[team] || '❓',
    reminder: apiRole.reminders?.[0] || '',
  };
}

function buildDynamicRoles(): Record<string, Role> {
  const apiRoles = getDynamicRoles();
  if (apiRoles.length === 0) return FALLBACK_ROLES;
  const roles: Record<string, Role> = {};
  for (const apiRole of apiRoles) {
    roles[apiRole.id] = apiRoleToInternal(apiRole);
  }
  return roles;
}

/**
 * Returns roles — dynamically built from API data when available.
 */
export function getRoles(): Record<string, Role> {
  return buildDynamicRoles();
}

/**
 * Reactive export for components that import ROLES directly.
 * This is a module-level variable that gets populated once dynamic data loads.
 * Components that use ROLES will get a snapshot at import time.
 * Use getRoles() for live dynamic data.
 */
export const ROLES: Record<string, Role> = buildDynamicRoles();

// Re-export with each render so components get updated data
// (This works because React Native's require cache keeps the reference)

export const TEAM_COLORS: Record<string, string> = {
  townsfolk: '#3492ea',
  outsider: '#46c646',
  minion: '#ea9eb1',
  demon: '#fcb93c',
  fabled: '#c084fc',
  traveller: '#e3e3e3',
};

export const TEAM_ORDER: Record<string, number> = {
  townsfolk: 0, outsider: 1, minion: 2, demon: 3, fabled: 4, traveller: 5,
};
