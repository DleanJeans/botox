import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { Conversation, Player } from '../types';

interface ConversationPanelProps {
  conversations: Conversation[];
  players: Player[];
  currentDay: number;
  onAddConversation: (participants: string[], initiatorId: string, notes: string) => void;
  onUpdateNotes: (convId: string, notes: string) => void;
  onDeleteConversation: (convId: string) => void;
}

export default function ConversationPanel({
  conversations,
  players,
  currentDay,
  onAddConversation,
  onUpdateNotes,
  onDeleteConversation,
}: ConversationPanelProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingConv, setEditingConv] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [initiatorId, setInitiatorId] = useState('');
  const [notes, setNotes] = useState('');
  const [filterDay, setFilterDay] = useState<number | null>(null);

  const days = useMemo(() => {
    const r = new Set(conversations.map(c => c.day));
    return Array.from(r).sort((a, b) => b - a);
  }, [conversations]);

  const filteredConversations = filterDay
    ? conversations.filter(c => c.day === filterDay)
    : conversations;

  const sortedConversations = [...filteredConversations].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  const handleStartConversation = () => {
    if (participants.length < 2) return;
    onAddConversation(participants, initiatorId || participants[0], notes);
    setParticipants([]);
    setInitiatorId('');
    setNotes('');
    setShowModal(false);
  };

  const toggleParticipant = (playerId: string) => {
    setParticipants(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const getPlayerName = (id: string) =>
    players.find(p => p.id === id)?.name || 'Unknown';

  const getPlayerEmoji = (id: string) => {
    const p = players.find(p => p.id === id);
    if (!p) return '👤';
    if (!p.isAlive) return '💀';
    return '❤️';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Conversations</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            setParticipants([]);
            setInitiatorId('');
            setNotes('');
            setShowModal(true);
          }}
        >
          <Text style={styles.addBtnText}>+ Log</Text>
        </Pressable>
      </View>

      {/* Day filter */}
      {days.length > 1 && (
        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterChip, filterDay === null && styles.filterChipActive]}
            onPress={() => setFilterDay(null)}
          >
            <Text style={[styles.filterChipText, filterDay === null && styles.filterChipTextActive]}>
              All
            </Text>
          </Pressable>
          {days.map(r => (
            <Pressable
              key={r}
              style={[styles.filterChip, filterDay === r && styles.filterChipActive]}
              onPress={() => setFilterDay(r)}
            >
              <Text style={[styles.filterChipText, filterDay === r && styles.filterChipTextActive]}>
                R{r}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Conversation list */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {sortedConversations.length === 0 ? (
          <Text style={styles.emptyText}>
            No conversations logged. Tap "+ Log" to track who's talking to whom.
          </Text>
        ) : (
          sortedConversations.map(conv => (
            <View key={conv.id} style={styles.convCard}>
              <View style={styles.convHeader}>
                <Text style={styles.convDay}>Day {conv.day}</Text>
                <View style={styles.convActions}>
                  <Pressable
                    onPress={() =>
                      setEditingConv(editingConv === conv.id ? null : conv.id)
                    }
                  >
                    <Text style={styles.editBtnIcon}>✏️</Text>
                  </Pressable>
                  <Pressable onPress={() => onDeleteConversation(conv.id)}>
                    <Text style={styles.deleteBtnIcon}>🗑️</Text>
                  </Pressable>
                </View>
              </View>

              {/* Participants */}
              <View style={styles.participantsRow}>
                {conv.participants.map(pid => (
                  <View key={pid} style={styles.participantChip}>
                    <Text style={styles.participantText}>
                      {getPlayerEmoji(pid)} {getPlayerName(pid)}
                      {pid === conv.initiatorId ? ' (started)' : ''}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Notes (editable inline) */}
              {editingConv === conv.id ? (
                <TextInput
                  style={styles.notesInput}
                  value={conv.notes}
                  onChangeText={text => onUpdateNotes(conv.id, text)}
                  placeholder="What was discussed?"
                  placeholderTextColor="#555"
                  multiline
                  onBlur={() => setEditingConv(null)}
                  autoFocus
                />
              ) : (
                conv.notes ? (
                  <Text style={styles.notesText}>{conv.notes}</Text>
                ) : (
                  <Text style={styles.notesPlaceholder}>Tap ✏️ to add notes</Text>
                )
              )}
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Conversation Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Conversation</Text>
            <Text style={styles.modalSubtitle}>Day {currentDay}</Text>

            {/* Select participants */}
            <Text style={styles.fieldLabel}>Who was involved?</Text>
            <View style={styles.playerGrid}>
              {players.map(player => (
                <Pressable
                  key={player.id}
                  style={[
                    styles.playerChip,
                    participants.includes(player.id) && styles.playerChipActive,
                    !player.isAlive && styles.playerChipDead,
                  ]}
                  onPress={() => toggleParticipant(player.id)}
                >
                  <Text style={styles.playerChipText}>
                    {!player.isAlive ? '💀 ' : ''}{player.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Who started it */}
            {participants.length >= 2 && (
              <>
                <Text style={styles.fieldLabel}>Who started it?</Text>
                <View style={styles.playerGrid}>
                  {participants.map(pid => {
                    const p = players.find(pl => pl.id === pid);
                    return (
                      <Pressable
                        key={pid}
                        style={[
                          styles.playerChip,
                          initiatorId === pid && styles.playerChipActive,
                        ]}
                        onPress={() => setInitiatorId(pid)}
                      >
                        <Text style={styles.playerChipText}>
                          {p?.name || pid}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {/* Notes */}
            <Text style={styles.fieldLabel}>Notes (what did you observe?)</Text>
            <TextInput
              style={styles.modalNotesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. They seemed nervous, kept looking at the Demon player..."
              placeholderTextColor="#555"
              multiline
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveBtn,
                  participants.length < 2 && styles.saveBtnDisabled,
                ]}
                onPress={handleStartConversation}
                disabled={participants.length < 2}
              >
                <Text style={styles.saveBtnText}>Log</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addBtnText: {
    color: '#3492ea',
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#2f313a',
  },
  filterChipActive: {
    backgroundColor: '#3a2f1a',
  },
  filterChipText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fcb93c',
  },
  emptyText: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  convCard: {
    backgroundColor: '#2f313a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  convDay: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  convActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtnIcon: {
    fontSize: 14,
  },
  deleteBtnIcon: {
    fontSize: 14,
  },
  participantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  participantChip: {
    backgroundColor: '#1e1f23',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantText: {
    color: '#ddd',
    fontSize: 12,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: '#1e1f23',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    fontSize: 12,
    minHeight: 60,
    lineHeight: 18,
  },
  notesText: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 18,
  },
  notesPlaceholder: {
    color: '#555',
    fontSize: 12,
    fontStyle: 'italic',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2f313a',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  playerChip: {
    backgroundColor: '#1e1f23',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3a3c43',
  },
  playerChipActive: {
    borderColor: '#fcb93c',
    backgroundColor: '#3a2f1a',
  },
  playerChipDead: {
    opacity: 0.5,
  },
  playerChipText: {
    color: '#ddd',
    fontSize: 13,
    fontWeight: '500',
  },
  modalNotesInput: {
    backgroundColor: '#1e1f23',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    fontSize: 13,
    minHeight: 80,
    lineHeight: 18,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
    fontSize: 15,
    fontWeight: '500',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fcb93c',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
