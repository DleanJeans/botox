export type Team = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'fabled' | 'traveller';

export interface Role {
  id: string;
  name: string;
  team: Team;
  firstNight?: number;
  otherNight?: number;
  ability: string;
  emoji: string;
  reminder: string;
}

export interface Player {
  id: string;
  name: string;
  isAlive: boolean;
  isGhostVote: boolean;

  // Position in the layout (circle or room)
  position: { x: number; y: number };
  // Whether position was manually dragged (vs auto-layout)
  positionLocked: boolean;

  // Detective board
  guessedRole: string | null;       // role ID the player thinks this person is
  claimedRole: string | null;       // what they claimed to be
  suspicion: 0 | 1 | 2 | 3;        // 0=none, 1=low, 2=medium, 3=high
  notes: string;
  nightTargets: string[];           // who they targeted at night (by player ID)
  voteHistory: VoteRecord[];
  defenseTokens: number;            // leftover defense tokens (for some scripts)
}

export interface VoteRecord {
  day: number;
  targetId: string;                 // who they voted for
  guilty: boolean;
}

export interface Conversation {
  id: string;
  day: number;
  participants: string[];           // player IDs involved
  initiatorId: string;              // who started the conversation
  notes: string;                    // what was observed / discussed
  timestamp: number;
}

export interface Game {
  id: string;
  name: string;
  createdAt: number;
  scriptId: string | null;          // null = no script / custom
  players: Player[];
  layout: 'circle' | 'room';
  editMode: boolean;
  currentDay: number;
  nightPhase: boolean;
  gameNotes: string;
  conversations: Conversation[];
}

export interface Script {
  id: string;
  name: string;
  roles: string[];                  // role IDs
}

// Drag item type for gesture handler
export interface DragData {
  playerId: string;
  offsetX: number;
  offsetY: number;
}

export interface Friend {
  id: string;
  name: string;
  notes: string;
  createdAt: number;
  lastPlayed: number | null;
  gameCount: number;
}

export interface SavedScript {
  id: string;
  name: string;
  author: string;
  version: string;
  roleIds: string[];
  savedAt: number;
}
