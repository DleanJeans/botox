import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getRoles } from '../data/roles';
import { getScriptRoles } from '../data/scripts';
import type { Player } from '../types';
import RoleCard from './RoleCard';
import RoleIcon from './RoleIcon';

interface PlayerBoardProps {
  visible: boolean;
  player: Player;
  scriptId?: string | null;
  onClose: () => void;
  onSetGuessedRole: (roleId: string | null) => void;
  onSetClaimedRole: (roleId: string | null) => void;
  onSetSuspicion: (level: 0 | 1 | 2 | 3) => void;
  onSetNotes: (notes: string) => void;
  onToggleAlive: () => void;
  onToggleGhostVote: () => void;
  gamePlayers?: Player[];
  currentDay?: number;
  onCastVote?: (targetId: string, guilty: boolean) => void;
}

export default function PlayerBoard({
  visible,
  player,
  scriptId,
  onClose,
  onSetGuessedRole,
  onSetClaimedRole,
  onSetSuspicion,
  onSetNotes,
  onToggleAlive,
  onToggleGhostVote,
  gamePlayers,
  currentDay,
  onCastVote,
}: PlayerBoardProps) {
  const [notes, setNotes] = useState(player.notes);
  const [showRolePicker, setShowRolePicker] = useState<'guess' | 'claim' | null>(null);

  const suspicionOptions = [
    { level: 0, label: 'None', emoji: '⚪' },
    { level: 1, label: 'Low', emoji: '🟢' },
    { level: 2, label: 'Medium', emoji: '🟡' },
    { level: 3, label: 'High', emoji: '🔴' },
  ] as const;

  const [voteTarget, setVoteTarget] = useState<string | null>(null);
  const scriptRoleIds = scriptId ? getScriptRoles(scriptId) : undefined;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
            <Text style={styles.playerName}>{player.name}</Text>
            <View style={styles.statusRow}>
              <Pressable
                onPress={onToggleAlive}
                style={[styles.statusBtn, player.isAlive ? styles.aliveBtn : styles.deadBtn]}
              >
                <Text style={styles.statusBtnText}>
                  {player.isAlive ? 'Alive' : 'Dead'}
                </Text>
              </Pressable>
              {!player.isAlive && (
                <Pressable
                  onPress={onToggleGhostVote}
                  style={[styles.statusBtn, player.isGhostVote ? styles.ghostOnBtn : styles.ghostOffBtn]}
                >
                  <Text style={styles.statusBtnText}>
                    {player.isGhostVote ? 'Ghost vote' : 'No ghost vote'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Suspect level */}
            <Text style={styles.sectionTitle}>Suspicion</Text>
            <View style={styles.suspicionRow}>
              {suspicionOptions.map(opt => (
                <Pressable
                  key={opt.level}
                  style={[
                    styles.suspicionBtn,
                    player.suspicion === opt.level && styles.suspicionActive,
                  ]}
                  onPress={() => onSetSuspicion(opt.level)}
                >
                  <Text style={styles.suspicionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.suspicionLabel, player.suspicion === opt.level && styles.suspicionLabelActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Guessed Role */}
            <Text style={styles.sectionTitle}>Role Guess</Text>
            <Pressable
              style={styles.rolePickerBtn}
              onPress={() => setShowRolePicker(showRolePicker === 'guess' ? null : 'guess')}
            >
              <Text style={styles.rolePickerText}>
                {player.guessedRole
                  ? `${getRoles()[player.guessedRole]?.name || player.guessedRole}`
                  : 'Tap to set a guess...'}
              </Text>
              {player.guessedRole && (
                <Pressable onPress={() => onSetGuessedRole(null)}>
                  <Text style={styles.clearBtn}>✕</Text>
                </Pressable>
              )}
            </Pressable>
            {showRolePicker === 'guess' && (
              <View style={{ gap: 4, marginTop: 8 }}>
                {(scriptRoleIds && scriptRoleIds.length > 0
                  ? scriptRoleIds.map(id => getRoles()[id]).filter(Boolean)
                  : Object.values(getRoles())
                ).map(role => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onSelect={(id) => { onSetGuessedRole(id); setShowRolePicker(null); }}
                  />
                ))}
              </View>
            )}

            {/* Claimed Role */}
            <Text style={styles.sectionTitle}>Claimed Role</Text>
            <Pressable
              style={styles.rolePickerBtn}
              onPress={() => setShowRolePicker(showRolePicker === 'claim' ? null : 'claim')}
            >
              <Text style={styles.rolePickerText}>
                {player.claimedRole
                  ? `${getRoles()[player.claimedRole]?.name || player.claimedRole}`
                  : 'Tap to set what they claimed...'}
              </Text>
              {player.claimedRole && (
                <Pressable onPress={() => onSetClaimedRole(null)}>
                  <Text style={styles.clearBtn}>✕</Text>
                </Pressable>
              )}
            </Pressable>
            {showRolePicker === 'claim' && (
              <View style={{ gap: 4, marginTop: 8 }}>
                {(scriptRoleIds && scriptRoleIds.length > 0
                  ? scriptRoleIds.map(id => getRoles()[id]).filter(Boolean)
                  : Object.values(getRoles())
                ).map(role => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onSelect={(id) => { onSetClaimedRole(id); setShowRolePicker(null); }}
                  />
                ))}
              </View>
            )}

            {/* Vote controls */}
            {onCastVote && gamePlayers && (
              <>
                <Text style={styles.sectionTitle}>Cast Vote</Text>
                <Text style={styles.voteDayLabel}>Day {currentDay || '?'}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voteTargetRow}>
                  {gamePlayers
                    .filter(p => p.id !== player.id)
                    .map(target => (
                      <Pressable
                        key={target.id}
                        style={[
                          styles.voteTargetChip,
                          voteTarget === target.id && styles.voteTargetActive,
                        ]}
                        onPress={() => setVoteTarget(voteTarget === target.id ? null : target.id)}
                      >
                        <Text style={styles.voteTargetText}>
                          {target.name}
                        </Text>
                        <View style={styles.voteTargetRole}>
                          {target.guessedRole && getRoles()[target.guessedRole] ? (
                            <RoleIcon roleId={getRoles()[target.guessedRole].id} team={getRoles()[target.guessedRole].team} size={16} showBorder={false} />
                          ) : null}
                        </View>
                      </Pressable>
                    ))}
                </ScrollView>
                {voteTarget && (
                  <View style={styles.voteActions}>
                    <Pressable
                      style={styles.voteGuiltyBtn}
                      onPress={() => {
                        onCastVote(voteTarget, true);
                        setVoteTarget(null);
                      }}
                    >
                      <Text style={styles.voteBtnText}>🔴 Guilty</Text>
                    </Pressable>
                    <Pressable
                      style={styles.voteInnocentBtn}
                      onPress={() => {
                        onCastVote(voteTarget, false);
                        setVoteTarget(null);
                      }}
                    >
                      <Text style={styles.voteBtnText}>🟢 Innocent</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}

            {/* Notes */}
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={text => {
                setNotes(text);
                onSetNotes(text);
              }}
              placeholder="Your observations, suspicions, alibis..."
              placeholderTextColor="#555"
              multiline
              textAlignVertical="top"
            />

            {/* Vote History */}
            {player.voteHistory.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Votes Cast</Text>
                {player.voteHistory.map((vote, i) => (
                  <View key={i} style={styles.voteRow}>
                    <Text style={styles.voteText}>
                      Day {vote.day}: voted for {vote.targetId}
                      {vote.guilty ? ' (guilty)' : ' (innocent)'}
                    </Text>
                  </View>
                ))}
              </>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1e1f23',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingTop: 16,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 40,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playerName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aliveBtn: {
    backgroundColor: '#166534',
  },
  deadBtn: {
    backgroundColor: '#7f1d1d',
  },
  ghostOnBtn: {
    backgroundColor: '#4a1942',
  },
  ghostOffBtn: {
    backgroundColor: '#333',
  },
  statusBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  body: {
    flex: 1,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  suspicionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  suspicionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  suspicionActive: {
    borderColor: '#fcb93c',
    backgroundColor: '#3a2f1a',
  },
  suspicionEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  suspicionLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  suspicionLabelActive: {
    color: '#fcb93c',
  },
  rolePickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2f313a',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rolePickerText: {
    color: '#ccc',
    fontSize: 14,
  },
  clearBtn: {
    color: '#ef4444',
    fontSize: 16,
    marginLeft: 8,
  },
  roleGrid: {
    marginTop: 8,
  },
  teamLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#2f313a',
    borderWidth: 1,
    borderColor: '#3a3c43',
  },
  roleChipActive: {
    borderColor: '#fcb93c',
    backgroundColor: '#3a2f1a',
  },
  roleChipText: {
    color: '#ddd',
    fontSize: 12,
  },
  notesInput: {
    backgroundColor: '#2f313a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    minHeight: 100,
    lineHeight: 20,
  },
  voteRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2f313a',
  },
  voteText: {
    color: '#aaa',
    fontSize: 13,
  },
  voteDayLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  voteTargetRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  voteTargetChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2f313a',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  voteTargetActive: {
    borderColor: '#fcb93c',
    backgroundColor: '#3a2f1a',
  },
  voteTargetText: {
    color: '#ddd',
    fontSize: 13,
    fontWeight: '600',
  },
  voteTargetRole: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  voteActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  voteGuiltyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7f1d1d',
    alignItems: 'center',
  },
  voteInnocentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#166534',
    alignItems: 'center',
  },
  voteBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
