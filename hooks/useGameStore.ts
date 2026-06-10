import { create } from 'zustand';
import { Game, Player, VoteRecord, Conversation } from '../types';
import { generateId } from '../utils/layout';
import { loadGames, upsertGame, deleteGame as deleteStoredGame } from '../utils/storage';

interface GameStore {
  games: Game[];
  currentGameId: string | null;

  loadGames: () => void;
  createGame: (name: string, scriptId: string | null) => string;
  deleteGame: (id: string) => void;
  setCurrentGame: (id: string | null) => void;

  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  toggleAlive: (playerId: string) => void;

  updatePlayerPosition: (playerId: string, x: number, y: number) => void;
  lockPlayerPosition: (playerId: string) => void;
  releasePlayerPosition: (playerId: string) => void;
  resetAllPositions: () => void;

  setLayout: (layout: 'circle' | 'room') => void;
  toggleEditMode: () => void;
  setEditMode: (edit: boolean) => void;

  setGuessedRole: (playerId: string, roleId: string | null) => void;
  setClaimedRole: (playerId: string, roleId: string | null) => void;
  setSuspicion: (playerId: string, level: 0 | 1 | 2 | 3) => void;
  setNotes: (playerId: string, notes: string) => void;
  addVoteRecord: (playerId: string, record: VoteRecord) => void;

  nextDay: () => void;
  prevDay: () => void;
  toggleGhostVote: (playerId: string) => void;

  setGameNotes: (notes: string) => void;
  getGameNotes: () => string;
  importScript: (name: string, roleIds: string[]) => void;
  clearScript: () => void;

  addConversation: (participants: string[], initiatorId: string, notes: string) => void;
  updateConversationNotes: (convId: string, notes: string) => void;
  deleteConversation: (convId: string) => void;
}

function updateAndSave(
  get: () => GameStore,
  updater: (game: Game) => Game,
) {
  const { games, currentGameId } = get();
  const idx = games.findIndex(g => g.id === currentGameId);
  if (idx === -1) return;

  const updated = updater({ ...games[idx] });
  const newGames = [...games];
  newGames[idx] = updated;
  upsertGame(updated);
  return { games: newGames };
}

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  currentGameId: null,

  loadGames: () => {
    const games = loadGames();
    set({ games });
  },

  createGame: (name: string, scriptId: string | null) => {
    const game: Game = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      scriptId,
      players: [],
      layout: 'circle',
      editMode: false,
      currentDay: 1,
      gameNotes: '',
      conversations: [],
    };
    const games = upsertGame(game);
    set({ games, currentGameId: game.id });
    return game.id;
  },

  deleteGame: (id: string) => {
    const games = deleteStoredGame(id);
    set(state => ({
      games,
      currentGameId: state.currentGameId === id ? null : state.currentGameId,
    }));
  },

  setCurrentGame: (id: string | null) => {
    set({ currentGameId: id });
  },

  addPlayer: (name: string) => {
    const result = updateAndSave(get, game => {
      const player: Player = {
        id: generateId(),
        name,
        isAlive: true,
        isGhostVote: false,
        position: { x: 0, y: 0 },
        positionLocked: false,
        guessedRole: null,
        claimedRole: null,
        suspicion: 0,
        notes: '',
        voteHistory: [],
        defenseTokens: 0,
      };
      return { ...game, players: [...game.players, player] };
    });
    if (result) set(result);
  },

  removePlayer: (playerId: string) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.filter(p => p.id !== playerId),
    }));
    if (result) set(result);
  },

  toggleAlive: (playerId: string) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p =>
        p.id === playerId
          ? { ...p, isAlive: !p.isAlive, isGhostVote: !p.isAlive ? false : p.isGhostVote }
          : p
      ),
    }));
    if (result) set(result);
  },

  toggleGhostVote: (playerId: string) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p =>
        p.id === playerId && !p.isAlive
          ? { ...p, isGhostVote: !p.isGhostVote }
          : p
      ),
    }));
    if (result) set(result);
  },

  updatePlayerPosition: (playerId: string, x: number, y: number) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p =>
        p.id === playerId ? { ...p, position: { x, y } } : p
      ),
    }));
    if (result) set(result);
  },

  lockPlayerPosition: (playerId: string) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p =>
        p.id === playerId ? { ...p, positionLocked: true } : p
      ),
    }));
    if (result) set(result);
  },

  releasePlayerPosition: (playerId: string) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p =>
        p.id === playerId ? { ...p, positionLocked: false } : p
      ),
    }));
    if (result) set(result);
  },

  resetAllPositions: () => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p => ({
        ...p, positionLocked: false, position: { x: 0, y: 0 },
      })),
    }));
    if (result) set(result);
  },

  setLayout: (layout: 'circle' | 'room') => {
    const result = updateAndSave(get, game => ({
      ...game,
      layout,
      players: game.players.map(p => ({
        ...p, positionLocked: false, position: { x: 0, y: 0 },
      })),
    }));
    if (result) set(result);
  },

  toggleEditMode: () => {
    const result = updateAndSave(get, game => ({ ...game, editMode: !game.editMode }));
    if (result) set(result);
  },

  setEditMode: (edit: boolean) => {
    const result = updateAndSave(get, game => ({ ...game, editMode: edit }));
    if (result) set(result);
  },

  setGuessedRole: (playerId: string, roleId: string | null) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p =>
        p.id === playerId ? { ...p, guessedRole: roleId } : p
      ),
    }));
    if (result) set(result);
  },

  setClaimedRole: (playerId: string, roleId: string | null) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p =>
        p.id === playerId ? { ...p, claimedRole: roleId } : p
      ),
    }));
    if (result) set(result);
  },

  setSuspicion: (playerId: string, level: 0 | 1 | 2 | 3) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p =>
        p.id === playerId ? { ...p, suspicion: level } : p
      ),
    }));
    if (result) set(result);
  },

  setNotes: (playerId: string, notes: string) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p =>
        p.id === playerId ? { ...p, notes } : p
      ),
    }));
    if (result) set(result);
  },

  addVoteRecord: (playerId: string, record: VoteRecord) => {
    const result = updateAndSave(get, game => ({
      ...game,
      players: game.players.map(p =>
        p.id === playerId
          ? { ...p, voteHistory: [...p.voteHistory, record] }
          : p
      ),
    }));
    if (result) set(result);
  },

  prevDay: () => {
    const result = updateAndSave(get, game => ({
      ...game,
      currentDay: Math.max(1, game.currentDay - 1),
    }));
    if (result) set(result);
  },

  nextDay: () => {
    const result = updateAndSave(get, game => ({
      ...game,
      currentDay: game.currentDay + 1,
    }));
    if (result) set(result);
  },

  setGameNotes: (notes: string) => {
    const result = updateAndSave(get, game => ({ ...game, gameNotes: notes }));
    if (result) set(result);
  },

  getGameNotes: () => {
    const { games, currentGameId } = get();
    const game = games.find(g => g.id === currentGameId);
    if (!game) return '';
    return game.gameNotes;
  },

  importScript: (name: string, roleIds: string[]) => {
    const result = updateAndSave(get, game => ({
      ...game,
      scriptId: name,
    }));
    if (result) set(result);
  },

  clearScript: () => {
    const result = updateAndSave(get, game => ({
      ...game,
      scriptId: null,
    }));
    if (result) set(result);
  },

  addConversation: (participants: string[], initiatorId: string, notes: string) => {
    const conv: Conversation = {
      id: generateId(),
      day: get().games.find(g => g.id === get().currentGameId)?.currentDay || 1,
      participants,
      initiatorId,
      notes,
      timestamp: Date.now(),
    };
    const result = updateAndSave(get, game => ({
      ...game,
      conversations: [...game.conversations, conv],
    }));
    if (result) set(result);
  },

  updateConversationNotes: (convId: string, notes: string) => {
    const result = updateAndSave(get, game => ({
      ...game,
      conversations: game.conversations.map(c =>
        c.id === convId ? { ...c, notes } : c
      ),
    }));
    if (result) set(result);
  },

  deleteConversation: (convId: string) => {
    const result = updateAndSave(get, game => ({
      ...game,
      conversations: game.conversations.filter(c => c.id !== convId),
    }));
    if (result) set(result);
  },
}));
