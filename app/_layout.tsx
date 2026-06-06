import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { useFriendStore } from '../hooks/useFriendStore';
import { useSavedScriptStore } from '../hooks/useSavedScriptStore';
import { preloadRoleData } from '../data/roleIcons';

const TABS = [
  { name: 'index' as const, icon: 'theater', label: 'Games' },
  { name: 'scripts' as const, icon: 'scroll', label: 'Scripts' },
  { name: 'friends' as const, icon: 'users', label: 'Friends' },
];

function TabNav({ currentRoute, navigate }: { currentRoute: string; navigate: (name: string) => void }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();

  if (isLandscape) {
    return (
      <View style={[lsStyles.sidebar, { paddingTop: insets.top + 20 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="theater" size={24} color="#fcb93c" />
          <Text style={lsStyles.logo}>The Grim</Text>
        </View>
        <Text style={lsStyles.subtitle}>Player Companion</Text>
        <View style={lsStyles.nav}>
          {TABS.map(tab => {
            const active = currentRoute === tab.name;
            return (
              <Pressable
                key={tab.name}
                style={[lsStyles.item, active && lsStyles.itemActive]}
                onPress={() => navigate(tab.name)}
              >
                <Icon name={tab.icon} size={22} color={active ? '#fcb93c' : '#ccc'} />
                <Text style={[lsStyles.label, active && lsStyles.labelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={[tbStyles.bar, { paddingBottom: insets.bottom + 4 }]}>
      {TABS.map(tab => {
        const active = currentRoute === tab.name;
        return (
          <Pressable
            key={tab.name}
            style={tbStyles.item}
            onPress={() => navigate(tab.name)}
          >
            <Icon name={tab.icon} size={22} color={active ? '#fcb93c' : '#888'} />
            <Text style={[tbStyles.label, active && tbStyles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function RootLayout() {
  const loadGames = useGameStore(s => s.loadGames);
  const loadFriends = useFriendStore(s => s.loadFriends);
  const loadScripts = useSavedScriptStore(s => s.loadScripts);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadGames();
    loadFriends();
    loadScripts();
    preloadRoleData();
  }, []);

  // Handle browser back — redirect to home on non-tab routes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      const path = window.location.pathname.replace(/\/$/, '');
      const route = path.split('/')[1] || 'index';
      if (!TABS.some(t => t.name === route)) {
        router.replace('/');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [router]);

  // Determine current route from URL segments
  const currentRoute = segments[0] || 'index';
  const isTabRoute = TABS.some(t => t.name === currentRoute);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const navigate = (name: string) => {
    if (name === 'index') router.push('/');
    else router.push(`/${name}`);
  };

  return (
    <View style={{ flex: 1, flexDirection: isLandscape ? 'row' : 'column', backgroundColor: '#1a1b1e' }}>
      <StatusBar style="light" />
      {isLandscape && isTabRoute && <TabNav currentRoute={currentRoute} navigate={navigate} />}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1a1b1e' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="scripts" />
        <Stack.Screen name="friends" />
        <Stack.Screen name="new-game" />
        <Stack.Screen name="game/[id]" />
        <Stack.Screen name="player/[id]" options={{ presentation: 'modal' }} />
      </Stack>
      {!isLandscape && isTabRoute && <TabNav currentRoute={currentRoute} navigate={navigate} />}
    </View>
  );
}

// ── Landscape sidebar styles ──
const lsStyles = StyleSheet.create({
  sidebar: { width: 220, backgroundColor: '#1e1f23', borderRightWidth: 1, borderRightColor: '#2f313a', paddingHorizontal: 16 },
  logo: { color: '#fcb93c', fontSize: 22, fontWeight: '800', marginBottom: 2 },
  subtitle: { color: '#888', fontSize: 12, marginBottom: 32 },
  nav: { gap: 2 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 },
  itemActive: { backgroundColor: '#2f313a' },
  icon: { fontSize: 20, marginRight: 12 },
  label: { color: '#ccc', fontSize: 15, fontWeight: '500' },
  labelActive: { color: '#fcb93c', fontWeight: '700' },
});

// ── Portrait tab bar styles ──
const tbStyles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: '#1a1b1e', borderTopWidth: 1, borderTopColor: '#2f313a', paddingTop: 6 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 4, gap: 2 },
  label: { color: '#888', fontSize: 11, fontWeight: '500' },
  labelActive: { color: '#fcb93c', fontWeight: '700' },
});
