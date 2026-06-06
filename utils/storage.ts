import { Game, Friend, SavedScript } from '../types';

const STORAGE_KEY = 'grim-player-games';
const FRIENDS_KEY = 'grim-player-friends';
const SAVED_SCRIPTS_KEY = 'grim-player-scripts';

export function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const games = JSON.parse(raw) as Game[];
    // Migrate old games missing new fields
    return games.map(g => {
      const old = g as any;
      return {
        ...g,
        // currentRound -> currentDay rename
        currentDay: g.currentDay ?? old.currentRound ?? 1,
        gameNotes: old.gameNotes || '',
        conversations: old.conversations || [],
      };
    });
  } catch {
    return [];
  }
}

export function saveGames(games: Game[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (e) {
    console.error('Failed to save games:', e);
  }
}

export function getGame(id: string): Game | undefined {
  const games = loadGames();
  return games.find(g => g.id === id);
}

export function upsertGame(game: Game): Game[] {
  const games = loadGames();
  const idx = games.findIndex(g => g.id === game.id);
  if (idx >= 0) {
    games[idx] = game;
  } else {
    games.push(game);
  }
  saveGames(games);
  return games;
}

export function deleteGame(id: string): Game[] {
  const games = loadGames().filter(g => g.id !== id);
  saveGames(games);
  return games;
}

// ── Friends ──

export function loadFriends(): Friend[] {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveFriend(friend: Friend): Friend[] {
  const friends = loadFriends();
  const idx = friends.findIndex(f => f.id === friend.id);
  if (idx >= 0) friends[idx] = friend;
  else friends.push(friend);
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
  return friends;
}

export function deleteFriend(id: string): Friend[] {
  const friends = loadFriends().filter(f => f.id !== id);
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
  return friends;
}

// ── Saved Scripts ──

export function loadSavedScripts(): SavedScript[] {
  try {
    const raw = localStorage.getItem(SAVED_SCRIPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveScript(script: SavedScript): SavedScript[] {
  const scripts = loadSavedScripts();
  const idx = scripts.findIndex(s => s.id === script.id);
  if (idx >= 0) scripts[idx] = script;
  else scripts.push(script);
  localStorage.setItem(SAVED_SCRIPTS_KEY, JSON.stringify(scripts));
  return scripts;
}

export function deleteSavedScript(id: string): SavedScript[] {
  const scripts = loadSavedScripts().filter(s => s.id !== id);
  localStorage.setItem(SAVED_SCRIPTS_KEY, JSON.stringify(scripts));
  return scripts;
}
