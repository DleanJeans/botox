import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// Synchronous cache populated from AsyncStorage on init (native only)
let cache: Record<string, string | null> = {};
let loaded = false;

async function hydrate() {
  if (loaded) return;
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    cache = Object.fromEntries(pairs);
  } catch {}
  loaded = true;
}

// Kick off hydration immediately (non-blocking)
hydrate();

export function platformGetItem(key: string): string | null {
  if (isWeb) return localStorage.getItem(key);
  return cache[key] ?? null;
}

export async function platformSetItem(
  key: string,
  value: string,
): Promise<void> {
  cache[key] = value;
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

export async function platformRemoveItem(key: string): Promise<void> {
  delete cache[key];
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}

/** Wait for native AsyncStorage cache to be ready (no-op on web) */
export async function ensureReady(): Promise<void> {
  if (isWeb) return;
  await hydrate();
}
