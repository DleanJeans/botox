import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  Text,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../hooks/useGameStore';
import { useResponsive } from '../../hooks/useResponsive';
import PlayerCircle from '../../components/PlayerCircle';
import PlayerRoom from '../../components/PlayerRoom';
import PlayerBoard from '../../components/PlayerBoard';
import PlayerListPanel from '../../components/PlayerListPanel';
import RoleBrowser from '../../components/RoleBrowser';
import GameLayout from '../../components/GameLayout';
import GameHeader from '../../components/GameHeader';

export default function GameScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDesktop } = useResponsive();

  // Ensure currentGameId is set for store operations (prevDay, nextDay, etc.)
  useEffect(() => {
    setCurrentGame(id);
  }, [id]);

  const games = useGameStore(s => s.games);
  const setCurrentGame = useGameStore(s => s.setCurrentGame);
  const addPlayer = useGameStore(s => s.addPlayer);
  const prevDay = useGameStore(s => s.prevDay);
  const removePlayer = useGameStore(s => s.removePlayer);
  const addVoteRecord = useGameStore(s => s.addVoteRecord);
  const toggleAlive = useGameStore(s => s.toggleAlive);
  const toggleGhostVote = useGameStore(s => s.toggleGhostVote);
  const updatePlayerPosition = useGameStore(s => s.updatePlayerPosition);
  const lockPlayerPosition = useGameStore(s => s.lockPlayerPosition);
  const releasePlayerPosition = useGameStore(s => s.releasePlayerPosition);

  const setLayout = useGameStore(s => s.setLayout);
  const toggleNightPhase = useGameStore(s => s.toggleNightPhase);
  const nextDay = useGameStore(s => s.nextDay);
  const setGuessedRole = useGameStore(s => s.setGuessedRole);
  const setClaimedRole = useGameStore(s => s.setClaimedRole);
  const setSuspicion = useGameStore(s => s.setSuspicion);
  const setNotes = useGameStore(s => s.setNotes);
  const addNightTarget = useGameStore(s => s.addNightTarget);
  const importScript = useGameStore(s => s.importScript);
  const clearScript = useGameStore(s => s.clearScript);
  const addConversation = useGameStore(s => s.addConversation);
  const updateConversationNotes = useGameStore(s => s.updateConversationNotes);
  const deleteConversation = useGameStore(s => s.deleteConversation);


  const game = games.find(g => g.id === id);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [roomDraggable, setRoomDraggable] = useState(false);
  const [playerDraggable, setPlayerDraggable] = useState(false);
  const setEditMode = useGameStore(s => s.setEditMode);

  const handleAddPlayer = useCallback(() => {
    setNewPlayerName('');
    setShowNamePrompt(true);
  }, []);

  const confirmAddPlayer = useCallback(() => {
    const name = newPlayerName.trim();
    if (name) {
      addPlayer(name);
    }
    setShowNamePrompt(false);
  }, [newPlayerName, addPlayer]);

  const handlePlayerPress = useCallback((playerId: string) => {
    setSelectedPlayerId(playerId);
  }, []);

  const handleRemovePlayer = useCallback(
    (playerId: string) => {
      const player = game?.players.find(p => p.id === playerId);
      if (player && typeof window !== 'undefined' && window.confirm) {
        if (!window.confirm(`Remove ${player.name}?`)) return;
      }
      removePlayer(playerId);
    },
    [game, removePlayer]
  );

  const handleBack = useCallback(() => {
    setCurrentGame(null);
    router.push('/');
  }, [setCurrentGame, router]);

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Pressable onPress={handleBack}>
          <View style={styles.backRow}>
            <View style={styles.backBtn}>
              <Text style={styles.backBtnArrow}>←</Text>
            </View>
            <Text style={styles.backLabel}>Back</Text>
          </View>
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Game not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedPlayer = selectedPlayerId
    ? game.players.find(p => p.id === selectedPlayerId)
    : null;

  const LayoutComponent = game.layout === 'circle' ? PlayerCircle : PlayerRoom;

  const gameArea = (
    <LayoutComponent
      game={game}
      dragMode={roomDraggable}
      onPlayerPress={handlePlayerPress}
      onUpdatePosition={updatePlayerPosition}
      onLockPosition={lockPlayerPosition}
      onReleasePosition={releasePlayerPosition}
    />
  );

  const playerListPanel = (
    <PlayerListPanel
      game={game}
      onPlayerPress={handlePlayerPress}
      onToggleAlive={(playerId) => toggleAlive(playerId)}
      onRemovePlayer={handleRemovePlayer}
      onAddConversation={addConversation}
      onUpdateConversationNotes={updateConversationNotes}
      onDeleteConversation={deleteConversation}
    />
  );

  const roleBrowserPanel = (
    <RoleBrowser
      scriptId={game.scriptId}
      onSelectRole={(roleId) => {
        if (selectedPlayer) {
          setGuessedRole(selectedPlayer.id, roleId);
        }
      }}
      onImportScript={importScript}
      onClearScript={clearScript}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header — always visible */}
      <GameHeader
        title={game.name}
        layout={game.layout}
        playerDraggable={playerDraggable}
        nightPhase={game.nightPhase}
        playerCount={game.players.length}
        currentDay={game.currentDay}
        roomDraggable={roomDraggable}
        onToggleLayout={() =>
          setLayout(game.layout === 'circle' ? 'room' : 'circle')
        }
        onToggleEdit={() => {
          const next = !playerDraggable;
          setPlayerDraggable(next);
          setEditMode(next);
        }}
        onToggleRoomDrag={() => setRoomDraggable(d => !d)}
        onToggleNight={toggleNightPhase}
        onBack={handleBack}
        onAddPlayer={handleAddPlayer}
      />

      {/* Responsive game layout */}
      <GameLayout
        gameArea={gameArea}
        playerListPanel={playerListPanel}
        roleBrowserPanel={roleBrowserPanel}
        isDesktop={isDesktop}
      />

      {/* Day navigation bar (desktop) */}
      {isDesktop && (
        <View style={styles.dayBar}>
          <Pressable
            style={styles.dayBtn}
            onPress={() => {
              if (game.currentDay > 1) {
                prevDay();
              }
            }}
          >
            <Text style={styles.dayBtnText}>Prev Day</Text>
          </Pressable>
          <Text style={styles.dayLabel}>
            Day {game.currentDay} {game.nightPhase ? '' : ''}
          </Text>
          <Pressable style={styles.dayBtn} onPress={nextDay}>
            <Text style={styles.dayBtnText}>Next Day</Text>
          </Pressable>
        </View>
      )}

      {/* Player Board Modal */}
      {selectedPlayer && (
        <PlayerBoard
          visible={!!selectedPlayer}
          player={selectedPlayer}
          scriptId={game.scriptId}
          onClose={() => setSelectedPlayerId(null)}
          onSetGuessedRole={(roleId) => {
            if (selectedPlayer) setGuessedRole(selectedPlayer.id, roleId);
          }}
          onSetClaimedRole={(roleId) => {
            if (selectedPlayer) setClaimedRole(selectedPlayer.id, roleId);
          }}
          onSetSuspicion={(level) => {
            if (selectedPlayer) setSuspicion(selectedPlayer.id, level);
          }}
          onSetNotes={(notes) => {
            if (selectedPlayer) setNotes(selectedPlayer.id, notes);
          }}
          onToggleAlive={() => {
            if (selectedPlayer) toggleAlive(selectedPlayer.id);
          }}
          onToggleGhostVote={() => {
            if (selectedPlayer) toggleGhostVote(selectedPlayer.id);
          }}
          gamePlayers={game.players}
          currentDay={game.currentDay}
          onCastVote={(targetId, guilty) => {
            if (selectedPlayer) {
              addVoteRecord(selectedPlayer.id, {
                day: game.currentDay,
                targetId,
                guilty,
              });
            }
          }}
        />
      )}

      {/* Add Player Modal */}
      <Modal visible={showNamePrompt} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNamePrompt(false)}
        >
          <Pressable style={styles.addModal} onPress={() => {}}>
            <TextInput
              style={styles.addInput}
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              placeholder="Player name"
              placeholderTextColor="#555"
              autoFocus
              onSubmitEditing={confirmAddPlayer}
            />
            <View style={styles.addModalActions}>
              <Pressable
                onPress={() => setShowNamePrompt(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={confirmAddPlayer} style={styles.confirmBtn}>
                <Text style={styles.confirmBtnText}>Add</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backLabel: {
    color: '#fcb93c',
    fontSize: 16,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: '#ef4444',
    fontSize: 16,
  },
  // Day navigation bar
  dayBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1e1f23',
    borderTopWidth: 1,
    borderTopColor: '#2f313a',
    gap: 16,
  },
  dayBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2f313a',
  },
  dayBtnText: {
    color: '#fcb93c',
    fontSize: 13,
    fontWeight: '600',
  },
  dayLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 120,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModal: {
    backgroundColor: '#2f313a',
    borderRadius: 16,
    padding: 24,
    width: 280,
  },
  addInput: {
    backgroundColor: '#1a1b1e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  addModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#3a3c43',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fcb93c',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
