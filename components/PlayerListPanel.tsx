import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { Game } from '../types';
import { ROLES, TEAM_COLORS } from '../data/roles';
import ConversationPanel from './ConversationPanel';
import RoleIcon from './RoleIcon';

interface PlayerListPanelProps {
  game: Game;
  onPlayerPress: (playerId: string) => void;
  onToggleAlive: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onClose?: () => void;
  compact?: boolean;
  onAddConversation?: (participants: string[], initiatorId: string, notes: string) => void;
  onUpdateConversationNotes?: (convId: string, notes: string) => void;
  onDeleteConversation?: (convId: string) => void;
}

export default function PlayerListPanel({
  game,
  onPlayerPress,
  onToggleAlive,
  onRemovePlayer,
  onClose,
  compact,
  onAddConversation,
  onUpdateConversationNotes,
  onDeleteConversation,
}: PlayerListPanelProps) {
  const [filter, setFilter] = useState<'all' | 'alive' | 'dead'>('all');
  const [view, setView] = useState<'players' | 'conversations'>('players');
  const [search, setSearch] = useState('');

  const filteredPlayers = useMemo(() => {
    let players = game.players;
    if (filter === 'alive') players = players.filter(p => p.isAlive);
    if (filter === 'dead') players = players.filter(p => !p.isAlive);
    if (search.trim()) {
      const q = search.toLowerCase();
      players = players.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.guessedRole && p.guessedRole.toLowerCase().includes(q)) ||
          (p.claimedRole && p.claimedRole.toLowerCase().includes(q))
      );
    }
    return players;
  }, [game.players, filter, search]);

  const suspicionEmoji = (level: number) => {
    if (level === 0) return '';
    if (level === 1) return '🟢';
    if (level === 2) return '🟡';
    return '🔴';
  };

  // Count conversations per player for badge display
  const convCount = useMemo(() => {
    const counts: Record<string, number> = {};
    const conversations = game.conversations || [];
    for (const c of conversations) {
      for (const pid of c.participants) {
        counts[pid] = (counts[pid] || 0) + 1;
      }
    }
    return counts;
  }, [game.conversations]);

  return (
    <View style={[styles.container, compact && styles.compact]}>
      {/* View tabs */}
      <View style={styles.viewTabRow}>
        <Pressable
          style={[styles.viewTab, view === 'players' && styles.viewTabActive]}
          onPress={() => setView('players')}
        >
          <Text style={[styles.viewTabText, view === 'players' && styles.viewTabTextActive]}>
            👥 Players
          </Text>
        </Pressable>
        <Pressable
          style={[styles.viewTab, view === 'conversations' && styles.viewTabActive]}
          onPress={() => setView('conversations')}
        >
          <Text style={[styles.viewTabText, view === 'conversations' && styles.viewTabTextActive]}>
            💬 Talks ({game.conversations.length})
          </Text>
        </Pressable>
      </View>

      {view === 'conversations' && onAddConversation ? (
        <ConversationPanel
          conversations={game.conversations}
          players={game.players}
          currentDay={game.currentDay}
          onAddConversation={onAddConversation}
          onUpdateNotes={onUpdateConversationNotes || (() => {})}
          onDeleteConversation={onDeleteConversation || (() => {})}
        />
      ) : (
      <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            Players{' '}
            <Text style={styles.count}>({game.players.length})</Text>
          </Text>
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {(['all', 'alive', 'dead'] as const).map(f => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[styles.filterText, filter === f && styles.filterTextActive]}
              >
                {f === 'all' ? 'All' : f === 'alive' ? 'Alive' : 'Dead'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search players..."
          placeholderTextColor="#555"
        />
      </View>

      {/* Player list */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredPlayers.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>
              {search ? 'No matching players' : 'No players yet'}
            </Text>
          </View>
        ) : (
          filteredPlayers.map(player => (
            <Pressable
              key={player.id}
              style={[styles.playerRow, !player.isAlive && styles.deadRow]}
              onPress={() => onPlayerPress(player.id)}
            >
              {/* Status dot */}
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: player.isAlive ? '#22c55e' : '#666' },
                ]}
              />

              {/* Player info */}
              <View style={styles.playerInfo}>
                <View style={styles.nameRow}>
                  <Text
                    style={[styles.playerName, !player.isAlive && styles.deadName]}
                    numberOfLines={1}
                  >
                    {player.name}
                  </Text>
                  {player.isGhostVote && <Text style={styles.ghostIcon}>👻</Text>}
                  {suspicionEmoji(player.suspicion) ? (
                    <Text style={styles.suspicionIcon}>
                      {suspicionEmoji(player.suspicion)}
                    </Text>
                  ) : null}
                </View>

                {/* Role info */}
                {(player.guessedRole || player.claimedRole) && (
                  <View style={styles.roleRow}>
                    {player.guessedRole && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        {ROLES[player.guessedRole] && (
                          <RoleIcon roleId={ROLES[player.guessedRole].id} team={ROLES[player.guessedRole].team} size={14} showBorder={false} />
                        )}
                        <Text style={styles.guessedRole} numberOfLines={1}>
                          {ROLES[player.guessedRole]?.name || player.guessedRole}
                        </Text>
                      </View>
                    )}
                    {player.claimedRole &&
                      player.claimedRole !== player.guessedRole && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          {ROLES[player.claimedRole] && (
                            <RoleIcon roleId={ROLES[player.claimedRole].id} team={ROLES[player.claimedRole].team} size={14} showBorder={false} />
                          )}
                          <Text style={styles.claimedRole} numberOfLines={1}>
                            claims {ROLES[player.claimedRole]?.name || player.claimedRole}
                          </Text>
                        </View>
                      )}
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={[styles.actionBtn, player.isAlive ? styles.killBtn : styles.reviveBtn]}
                  onPress={() => onToggleAlive(player.id)}
                >
                  <Text style={styles.actionBtnText}>
                    {player.isAlive ? '💀' : '❤️'}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => onRemovePlayer(player.id)}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1f23',
  },
  viewTabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2f313a',
  },
  viewTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  viewTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#fcb93c',
  },
  viewTabText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  viewTabTextActive: {
    color: '#fcb93c',
    fontWeight: '700',
  },
  compact: {
    borderLeftWidth: 1,
    borderLeftColor: '#2f313a',
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2f313a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  count: {
    color: '#888',
    fontSize: 14,
    fontWeight: '400',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#aaa',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#2f313a',
  },
  filterChipActive: {
    backgroundColor: '#3a5a3f',
  },
  filterText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  searchInput: {
    backgroundColor: '#2f313a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  emptyRow: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#282a2e',
  },
  deadRow: {
    opacity: 0.6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  playerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deadName: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  ghostIcon: {
    fontSize: 12,
  },
  suspicionIcon: {
    fontSize: 12,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  guessedRole: {
    color: '#94a3b8',
    fontSize: 11,
  },
  claimedRole: {
    color: '#fbbf24',
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  killBtn: {
    backgroundColor: '#3a1a1a',
  },
  reviveBtn: {
    backgroundColor: '#1a3a1a',
  },
  actionBtnText: {
    fontSize: 12,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#666',
    fontSize: 10,
  },
});
