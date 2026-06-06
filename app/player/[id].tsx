import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../hooks/useGameStore';

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const games = useGameStore(s => s.games);
  const currentGameId = useGameStore(s => s.currentGameId);

  const game = games.find(g => g.id === currentGameId);
  const player = game?.players.find(p => p.id === id);

  if (!player) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Player not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.status}>
          {player.isAlive ? 'Alive' : 'Dead'}
          {player.isGhostVote ? ' · Ghost vote' : ''}
        </Text>
        {player.guessedRole && (
          <Text style={styles.info}>Guessed: {player.guessedRole}</Text>
        )}
        {player.claimedRole && (
          <Text style={styles.info}>Claims: {player.claimedRole}</Text>
        )}
        {player.notes ? (
          <Text style={styles.notes}>{player.notes}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
  },
  content: {
    padding: 20,
  },
  error: {
    color: '#ef4444',
    fontSize: 16,
    padding: 20,
  },
  name: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  status: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 8,
  },
  info: {
    color: '#ddd',
    fontSize: 15,
    marginTop: 12,
  },
  notes: {
    color: '#888',
    fontSize: 14,
    marginTop: 20,
    lineHeight: 20,
  },
});
