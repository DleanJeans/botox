import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useGameStore } from '../hooks/useGameStore';
import { useResponsive } from '../hooks/useResponsive';
import ContentWrapper from '../components/ContentWrapper';

export default function HomeScreen() {
  const router = useRouter();
  const games = useGameStore(s => s.games);
  const deleteGame = useGameStore(s => s.deleteGame);
  const setCurrentGame = useGameStore(s => s.setCurrentGame);
  const { isLandscape, isDesktop } = useResponsive();
  const isWide = isLandscape || isDesktop;

  const handleNewGame = () => router.push('/new-game');

  const handleOpenGame = (id: string) => {
    setCurrentGame(id);
    router.push(`/game/${id}`);
  };

  const handleDeleteGame = (id: string, name: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm(`Delete "${name}"?`)) return;
      deleteGame(id);
    }
  };

  const renderGameCard = ({ item }: { item: any }) => (
    <Pressable
      style={[styles.gameCard, isWide && styles.gameCardWide]}
      onPress={() => handleOpenGame(item.id)}
      onLongPress={() => handleDeleteGame(item.id, item.name)}
    >
      <View style={styles.gameCardLeft}>
        <Text style={styles.gameName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.gameMeta}>
          {item.players.length} player{item.players.length !== 1 ? 's' : ''} · Day {item.currentDay}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name={item.layout === 'circle' ? 'circle' : 'square'} size={14} color="#666" />
          <Text style={styles.gameLayout}>
            {item.layout === 'circle' ? 'Circle' : 'Room'}
          </Text>
        </View>
      </View>
      <Text style={styles.gameArrow}>→</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ContentWrapper isWide={isWide} maxWidth={900}>
      {/* Header */}
      <View style={[styles.header, isWide && styles.headerWide]}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="theater" size={28} color="#fcb93c" />
            <Text style={styles.logo}>The Grim</Text>
          </View>
          <Text style={styles.subtitle}>Player Companion</Text>
        </View>
        <Pressable style={styles.createBtn} onPress={handleNewGame}>
          <Text style={styles.createBtnText}>+ New Game</Text>
        </Pressable>
      </View>

      {/* Empty or game list */}
      {games.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎲</Text>
          <Text style={styles.emptyTitle}>No games yet</Text>
          <Text style={styles.emptySubtitle}>
            Create a game to start tracking players, roles, and suspicions
          </Text>
          <Pressable style={styles.emptyCreateBtn} onPress={handleNewGame}>
            <Text style={styles.createBtnText}>+ New Game</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={games.slice().reverse()}
            keyExtractor={item => item.id}
            numColumns={isWide ? 2 : 1}
            key={isWide ? 'grid' : 'list'}
            contentContainerStyle={[styles.list, isWide && styles.listWide]}
            columnWrapperStyle={isWide ? styles.columnWrapper : undefined}
            renderItem={renderGameCard}
          />
          {!isWide && (
            <View style={styles.footer}>
              <Pressable style={styles.footerCreateBtn} onPress={handleNewGame}>
                <Text style={styles.createBtnText}>+ New Game</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
      </ContentWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1b1e' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#2a2c30',
  },
  headerWide: { paddingLeft: 24, paddingRight: 32 },
  logo: { color: '#fcb93c', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#888', fontSize: 13, marginTop: 1 },
  createBtn: {
    backgroundColor: '#fcb93c', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
  },
  createBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: {
    color: '#888', fontSize: 15, textAlign: 'center', lineHeight: 22,
    marginBottom: 32, maxWidth: 400,
  },
  emptyCreateBtn: {
    backgroundColor: '#fcb93c', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32,
  },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  listWide: { paddingLeft: 24, paddingRight: 24, paddingTop: 12 },
  columnWrapper: { gap: 10 },
  gameCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2f313a',
    borderRadius: 14, padding: 16, marginBottom: 10,
  },
  gameCardWide: { flex: 1, marginBottom: 10 },
  gameCardLeft: { flex: 1 },
  gameName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  gameMeta: { color: '#888', fontSize: 12, marginTop: 3 },
  gameLayout: { color: '#666', fontSize: 11, marginTop: 1 },
  gameArrow: { color: '#666', fontSize: 18 },
  footer: { paddingHorizontal: 16, paddingVertical: 12 },
  footerCreateBtn: {
    backgroundColor: '#fcb93c', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
});
