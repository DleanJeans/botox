import type { Game, StoredScript } from '@/types/game';

export function getScriptPlayCounts(games: Game[]) {
  const gamesPlayedByScript = new Map<string, number>();

  for (const game of games) {
    const scriptId = game.scriptId ?? game.script?.id;

    if (scriptId) {
      gamesPlayedByScript.set(scriptId, (gamesPlayedByScript.get(scriptId) ?? 0) + 1);
    }
  }

  return gamesPlayedByScript;
}

export function sortScriptsByMostPlayed(scripts: StoredScript[], games: Game[]) {
  const gamesPlayedByScript = getScriptPlayCounts(games);

  return [...scripts].sort((first, second) => {
    const gamesDifference =
      (gamesPlayedByScript.get(second.id) ?? 0) - (gamesPlayedByScript.get(first.id) ?? 0);

    return (
      gamesDifference || first.name.localeCompare(second.name, undefined, { sensitivity: 'base' })
    );
  });
}
