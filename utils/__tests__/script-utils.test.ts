import type { Game, StoredScript } from '@/types/game';
import { getScriptPlayCounts, sortScriptsByMostPlayed } from '@/utils/script-utils';

const scripts: StoredScript[] = [
  createScript('script-z', 'Zulu'),
  createScript('script-a', 'Alpha'),
  createScript('script-b', 'Bravo'),
  createScript('script-unused', 'Unused'),
];
let nextGameId = 0;

describe('script utils', () => {
  it('counts each saved game by its effective script ID', () => {
    const games = [
      createGame({ scriptId: 'script-z' }),
      createGame({ script: scripts[1] }),
      createGame({ scriptId: 'missing-script' }),
      createGame(),
    ];

    expect([...getScriptPlayCounts(games)]).toEqual([
      ['script-z', 1],
      ['script-a', 1],
      ['missing-script', 1],
    ]);
  });

  it('sorts scripts by all saved games, including legacy embedded script IDs', () => {
    const games = [
      createGame({ scriptId: 'script-z' }),
      createGame({ scriptId: 'script-z' }),
      createGame({ script: scripts[1] }),
      createGame({ scriptId: 'script-b' }),
    ];

    expect(sortScriptsByMostPlayed(scripts, games).map((script) => script.name)).toEqual([
      'Zulu',
      'Alpha',
      'Bravo',
      'Unused',
    ]);
  });

  it('ignores games without a script and references to missing scripts', () => {
    const games = [
      createGame(),
      createGame({ scriptId: 'missing-script' }),
      createGame({ scriptId: 'script-a' }),
    ];

    expect(sortScriptsByMostPlayed(scripts, games).map((script) => script.name)).toEqual([
      'Alpha',
      'Bravo',
      'Unused',
      'Zulu',
    ]);
  });

  it('sorts ties alphabetically without mutating the input', () => {
    const originalOrder = [...scripts];
    const sortedScripts = sortScriptsByMostPlayed(scripts, []);

    expect(sortedScripts.map((script) => script.name)).toEqual([
      'Alpha',
      'Bravo',
      'Unused',
      'Zulu',
    ]);
    expect(scripts).toEqual(originalOrder);
  });
});

function createScript(id: string, name: string): StoredScript {
  return {
    id,
    name,
    roles: [],
    updatedAt: '2026-09-09T00:00:00.000Z',
    version: '1.0.0',
  };
}

function createGame(overrides: Partial<Game> = {}): Game {
  return {
    activeDay: 1,
    conversations: [],
    createdAt: '2026-09-09T00:00:00.000Z',
    id: `game-${nextGameId++}`,
    players: [],
    updatedAt: '2026-09-09T00:00:00.000Z',
    ...overrides,
  };
}
