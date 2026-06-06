import { create } from 'zustand';
import { Friend } from '../types';
import { generateId } from '../utils/layout';

const STORAGE_KEY = 'grim-player-friends';

function loadFriends(): Friend[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFriends(friends: Friend[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(friends)); } catch {}
}

interface FriendStore {
  friends: Friend[];
  loadFriends: () => void;
  addFriend: (name: string, notes: string) => void;
  updateFriend: (id: string, name: string, notes: string) => void;
  deleteFriend: (id: string) => void;
  recordGamePlayed: (id: string) => void;
}

export const useFriendStore = create<FriendStore>((set, get) => ({
  friends: [],
  loadFriends: () => set({ friends: loadFriends() }),
  addFriend: (name, notes) => {
    const friend: Friend = {
      id: generateId(),
      name,
      notes,
      createdAt: Date.now(),
      lastPlayed: null,
      gameCount: 0,
    };
    const friends = [...get().friends, friend];
    saveFriends(friends);
    set({ friends });
  },
  updateFriend: (id, name, notes) => {
    const friends = get().friends.map(f =>
      f.id === id ? { ...f, name, notes } : f
    );
    saveFriends(friends);
    set({ friends });
  },
  deleteFriend: (id) => {
    const friends = get().friends.filter(f => f.id !== id);
    saveFriends(friends);
    set({ friends });
  },
  recordGamePlayed: (id) => {
    const friends = get().friends.map(f =>
      f.id === id ? { ...f, lastPlayed: Date.now(), gameCount: f.gameCount + 1 } : f
    );
    saveFriends(friends);
    set({ friends });
  },
}));
