import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../hooks/useGameStore';
import { useFriendStore } from '../hooks/useFriendStore';
import { useSavedScriptStore } from '../hooks/useSavedScriptStore';
import { getScripts } from '../data/scripts';
import { useResponsive } from '../hooks/useResponsive';
import Icon from '../components/Icon';
import ScriptDetailModal from '../modals/ScriptDetailModal';

export default function NewGameScreen() {
  const router = useRouter();
  const createGame = useGameStore(s => s.createGame);
  const addPlayer = useGameStore(s => s.addPlayer);

  const { friends, loadFriends } = useFriendStore();
  const { scripts: savedScripts, loadScripts } = useSavedScriptStore();

  useEffect(() => { loadFriends(); loadScripts(); }, []);

  const [gameName, setGameName] = useState('');
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [showScriptDropdown, setShowScriptDropdown] = useState(false);
  const [previewScript, setPreviewScript] = useState<{ name: string; roleIds: string[] } | null>(null);
  const [autoCompleteIdx, setAutoCompleteIdx] = useState<number | null>(null);

  const scripts = getScripts();

  const defaultName = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayName = days[now.getDay()];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const scriptName = scripts.find(s => s.id === selectedScript)?.name || '';
    return `${hour12}${ampm} ${dayName}${scriptName ? ' ' + scriptName : ''} ${months[now.getMonth()]} ${now.getDate()}`;
  }, [selectedScript]);

  // Set default script if not set
  useEffect(() => {
    if (!selectedScript && scripts.length > 0) {
      setSelectedScript(scripts[0].id);
    }
  }, [scripts.length]);

  const { isLandscape, isDesktop } = useResponsive();
  const isWide = isLandscape || isDesktop;
  const [showFriends, setShowFriends] = useState(isWide);

  const handleCreate = () => {
    const name = gameName.trim() || defaultName;
    const gameId = createGame(name, selectedScript || scripts[0]?.id || null);
    playerNames.filter(n => n.trim()).forEach(n => addPlayer(n.trim()));
    router.replace(`/game/${gameId}`);
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const addPlayerRow = () => {
    setPlayerNames([...playerNames, '']);
    // refs array will be extended on next render
  };
  const removePlayerRow = (index: number) => {
    if (playerNames.length <= 1) {
      setPlayerNames(['']);
      return;
    }
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>New Game</Text>
      </View>

      <ScrollView
        style={[styles.body, isWide && styles.bodyWide]}
        contentContainerStyle={[
          styles.bodyContent,
          isWide && styles.bodyContentWide,
        ]}
      >
        {/* ── Landscape: two-column layout ── */}
        <View style={[isWide && styles.twoColumn]}>
          {/* Left Column: Game Name + Script */}
          <View style={[isWide && styles.columnLeft]}>
            {/* Game Name */}
            <Text style={styles.label}>Game Name</Text>
            <TextInput
              style={styles.input}
              value={gameName}
              onChangeText={setGameName}
              placeholder={defaultName}
              placeholderTextColor="#555"
            />

            {/* Script */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Script</Text>
              <Pressable
                style={styles.previewBtn}
                onPress={() => {
                  const match = [...scripts, ...savedScripts].find(s => s.id === selectedScript);
                  if (match) {
                    const roleIds = 'roles' in match ? match.roles : match.roleIds;
                    setPreviewScript({ name: match.name, roleIds });
                  }
                }}
              >
                <Text style={styles.previewBtnText}>Preview</Text>
              </Pressable>
            </View>
            {isWide ? (
              /* Landscape: full-height list with radios */
              <ScrollView style={styles.scriptScrollFull} showsVerticalScrollIndicator={false}>
                <View style={styles.scriptList}>
                  {savedScripts.length > 0 && (
                    <>
                      <Text style={styles.scriptSectionLabel}>Saved Scripts</Text>
                      {savedScripts.map(s => (
                        <Pressable
                          key={s.id}
                          style={[styles.scriptRowItem, selectedScript === s.id && styles.scriptRowActive]}
                          onPress={() => setSelectedScript(s.id)}
                        >
                          <View style={styles.radioOuter}>
                            {selectedScript === s.id && <View style={styles.radioInner} />}
                          </View>
                          <Text style={[styles.scriptRowText, selectedScript === s.id && styles.scriptRowTextActive]}>
                            {s.name}
                          </Text>
                        </Pressable>
                      ))}
                    </>
                  )}
                  <Text style={[styles.scriptSectionLabel, { marginTop: 16 }]}>Official Scripts</Text>
                  {scripts.map(s => (
                    <Pressable
                      key={s.id}
                      style={[styles.scriptRowItem, selectedScript === s.id && styles.scriptRowActive]}
                      onPress={() => setSelectedScript(s.id)}
                    >
                      <View style={styles.radioOuter}>
                        {selectedScript === s.id && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.scriptRowText, selectedScript === s.id && styles.scriptRowTextActive]}>
                        {s.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            ) : (
              /* Portrait: dropdown with modal picker */
              <View style={styles.dropdown}>
                <Pressable
                  style={styles.dropdownHeader}
                  onPress={() => setShowScriptDropdown(true)}
                >
                  <Text style={styles.dropdownText}>
                    {[...scripts, ...savedScripts].find(s => s.id === selectedScript)?.name || 'Select a script'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </Pressable>

                <Modal visible={showScriptDropdown} transparent animationType="fade">
                  <Pressable style={styles.modalOverlay} onPress={() => setShowScriptDropdown(false)}>
                    <Pressable style={styles.pickerSheet} onPress={() => {}}>
                      <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Script</Text>
                        <Pressable onPress={() => setShowScriptDropdown(false)}>
                          <Text style={styles.pickerClose}>✕</Text>
                        </Pressable>
                      </View>
                      <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                        {savedScripts.length > 0 && (
                          <>
                            <Text style={styles.pickerSectionLabel}>Saved Scripts</Text>
                            {savedScripts.map(s => (
                              <Pressable
                                key={s.id}
                                style={[styles.pickerItem, selectedScript === s.id && styles.pickerItemActive]}
                                onPress={() => {
                                  setSelectedScript(s.id);
                                  setShowScriptDropdown(false);
                                }}
                              >
                                <Text style={[styles.pickerItemText, selectedScript === s.id && styles.pickerItemTextActive]}>
                                  {s.name}
                                </Text>
                                {selectedScript === s.id && <Text style={styles.pickerCheck}>✓</Text>}
                              </Pressable>
                            ))}
                          </>
                        )}
                        <Text style={styles.pickerSectionLabel}>Official Scripts</Text>
                        {scripts.map(s => (
                          <Pressable
                            key={s.id}
                            style={[styles.pickerItem, selectedScript === s.id && styles.pickerItemActive]}
                            onPress={() => {
                              setSelectedScript(s.id);
                              setShowScriptDropdown(false);
                            }}
                          >
                            <Text style={[styles.pickerItemText, selectedScript === s.id && styles.pickerItemTextActive]}>
                              {s.name}
                            </Text>
                            {selectedScript === s.id && <Text style={styles.pickerCheck}>✓</Text>}
                          </Pressable>
                        ))}
                      </ScrollView>
                    </Pressable>
                  </Pressable>
                </Modal>
              </View>
            )}

            {/* Create button (visible in landscape sidebar) */}
            {isWide && (
              <Pressable style={styles.createBtnWide} onPress={handleCreate}>
                <Text style={styles.createBtnText}>Create Game</Text>
              </Pressable>
            )}
          </View>

          {/* Right Column: Players */}
          <View style={[isWide && styles.columnRight]}>
            <View style={styles.playersHeader}>
              <Text style={styles.label}>Players</Text>
              <Pressable onPress={() => setShowFriends(!showFriends)} style={styles.friendsToggle}>
                <Icon name="users" size={18} color="#888" />
              </Pressable>
            </View>

            {/* Friends selector — on top of player list */}
            {showFriends && friends.length > 0 && (
              <View style={styles.friendsSection}>
                <Text style={styles.friendsSectionTitle}>Select from Friends</Text>
                <View style={styles.friendsGrid}>
                  {friends.filter(f => !playerNames.includes(f.name)).sort((a, b) => a.name.localeCompare(b.name)).map(f => (
                    <Pressable
                      key={f.id}
                      style={styles.friendChip}
                      onPress={() => {
                        if (playerNames.includes(f.name)) return;
                        const emptyIdx = playerNames.findIndex(n => !n.trim());
                        if (emptyIdx >= 0) {
                          const updated = [...playerNames];
                          updated[emptyIdx] = f.name;
                          setPlayerNames(updated);
                        } else {
                          setPlayerNames([...playerNames, f.name]);
                        }
                      }}
                    >
                      <Text style={styles.friendChipName}>{f.name}</Text>
                      {f.notes ? <Text style={styles.friendChipNotes} numberOfLines={1}>{f.notes}</Text> : null}
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {playerNames.map((name, i) => {
              const showAuto = autoCompleteIdx === i && name.trim().length > 0;
              const matches = showAuto
                ? friends.filter(f =>
                    f.name.toLowerCase().includes(name.toLowerCase()) &&
                    !playerNames.includes(f.name)
                  ).slice(0, 5)
                : [];
              return (
                <View key={i} style={[styles.playerRow, isWide && styles.playerRowWide]}>
                  <Text style={styles.playerIndex}>{i + 1}.</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={el => { inputRefs.current[i] = el; }}
                      style={[styles.playerInput, friends.some(f => f.name === name) && styles.playerInputLocked]}
                      value={name}
                      editable={!friends.some(f => f.name === name)}
                      onChangeText={text => {
                        updatePlayerName(i, text);
                        setAutoCompleteIdx(text ? i : null);
                      }}
                      onFocus={() => name && setAutoCompleteIdx(i)}
                      onBlur={() => setTimeout(() => setAutoCompleteIdx(null), 200)}
                      placeholder={`Player ${i + 1}`}
                      placeholderTextColor="#555"
                      returnKeyType={i < playerNames.length - 1 ? 'next' : 'next'}
                      onSubmitEditing={() => {
                        if (i < playerNames.length - 1) {
                          inputRefs.current[i + 1]?.focus();
                        } else {
                          // Last input: add a new row and focus it
                          const idx = playerNames.length;
                          addPlayerRow();
                          setTimeout(() => inputRefs.current[idx]?.focus(), 50);
                        }
                      }}
                      blurOnSubmit
                    />
                    {matches.length > 0 && (
                      <View style={styles.autoList}>
                        {matches.map(f => (
                          <Pressable
                            key={f.id}
                            style={styles.autoItem}
                            onPress={() => {
                              updatePlayerName(i, f.name);
                              setAutoCompleteIdx(null);
                              // Focus next empty input or last + 1
                              const nextEmpty = playerNames.findIndex((n, idx) => idx > i && !n.trim());
                              const next = nextEmpty >= 0 ? nextEmpty : playerNames.length;
                              setTimeout(() => inputRefs.current[next]?.focus(), 50);
                            }}
                          >
                            <Text style={styles.autoItemText}>{f.name}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                  <Pressable onPress={() => removePlayerRow(i)} style={styles.removeBtn} tabIndex={-1}>
                      <Text style={styles.removeBtnText}>✕</Text>
                    </Pressable>
                </View>
              );
            })}


            {/* Extra add button at bottom of list */}
            {playerNames.length > 0 && (
              <Pressable style={styles.addRowBtn} onPress={addPlayerRow}>
                <Text style={styles.addRowBtnText}>+ Add another player</Text>
              </Pressable>
            )}

          </View>
        </View>
      </ScrollView>

      {/* Portrait footer button */}
      {!isWide && (
        <View style={styles.footer}>
          <Pressable style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.createBtnText}>Create Game</Text>
          </Pressable>
        </View>
      )}
      {previewScript && (
        <ScriptDetailModal
          visible={!!previewScript}
          scriptName={previewScript.name}
          roleIds={previewScript.roleIds}
          onClose={() => setPreviewScript(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2c30',
  },
  backBtn: {
    marginRight: 12,
  },
  backBtnText: {
    color: '#fcb93c',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  bodyWide: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bodyContentWide: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },

  // ── Landscape two-column — fill all real estate ──
  twoColumn: {
    flexDirection: 'row',
    gap: 48,
    paddingTop: 24,
    flex: 1,
  },
  columnLeft: {
    flex: 2,
  },
  columnRight: {
    flex: 3,
  },

  // ── Labels ──
  label: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
  },

  // ── Game Name Input ──
  input: {
    backgroundColor: '#2f313a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },

  // ── Script Picker ──
  scriptList: {
    gap: 6,
  },
  scriptRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2f313a',
    borderWidth: 1,
    borderColor: '#3a3c43',
  },
  scriptRowActive: {
    borderColor: '#fcb93c',
    backgroundColor: '#3a2f1a',
  },
  scriptRowText: {
    color: '#ccc',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  scriptRowTextActive: {
    color: '#fcb93c',
    fontWeight: '700',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fcb93c',
  },

  // ── Players ──
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputWrapper: { flex: 1 },
  autoList: {
    backgroundColor: '#222326', borderRadius: 8, marginTop: 4, marginBottom: 4,
    overflow: 'hidden',
  },
  autoItem: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#1a1b1e',
  },
  autoItemText: { color: '#ddd', fontSize: 14 },
  friendsToggle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#2f313a',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  friendsToggleText: { fontSize: 16 },
  friendsSection: {
    marginTop: 12, backgroundColor: '#2a2c30', borderRadius: 12, padding: 12, marginBottom: 12,
  },
  friendsSectionTitle: {
    color: '#aaa', fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 8,
  },
  friendsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
  },
  friendChip: {
    backgroundColor: '#1e1f23', borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8, borderWidth: 1, borderColor: '#3a3c43',
  },
  friendChipName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  friendChipNotes: { color: '#888', fontSize: 11, marginTop: 2, maxWidth: 120 },
  scriptScrollFull: { flex: 1, marginBottom: 12 },
  dropdown: {},
  dropdownHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#2f313a', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownText: { color: '#fff', fontSize: 15, flex: 1 },
  dropdownArrow: { color: '#888', fontSize: 12, marginLeft: 8 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center',
    alignItems: 'center',
  },
  pickerSheet: {
    backgroundColor: '#2f313a', borderRadius: 16, width: '85%', maxWidth: 400,
    maxHeight: '70%', overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#3a3c43',
  },
  pickerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  pickerClose: { color: '#888', fontSize: 18, fontWeight: '600' },
  pickerItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#2a2c30',
  },
  pickerItemActive: { backgroundColor: '#3a2f1a' },
  pickerItemText: { color: '#ccc', fontSize: 15 },
  pickerItemTextActive: { color: '#fcb93c', fontWeight: '700' },
  pickerCheck: { color: '#fcb93c', fontSize: 18, fontWeight: '700' },
  scriptSectionLabel: {
    color: '#888', fontSize: 11, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 6, marginTop: 4,
  },
  pickerSectionLabel: {
    color: '#888', fontSize: 11, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.5, paddingHorizontal: 20, paddingVertical: 8,
  },
  savedLabel: {
    color: '#888', fontSize: 11, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.5, marginTop: 12, marginBottom: 4,
  },
  previewBtn: {
    backgroundColor: '#2f313a', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  previewBtnText: { color: '#aaa', fontSize: 12, fontWeight: '500' },
  addPlayerBtn: {
    color: '#fcb93c',
    fontSize: 15,
    fontWeight: '600',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerRowWide: {
    marginBottom: 6,
  },
  playerIndex: {
    color: '#666',
    fontSize: 14,
    width: 28,
    fontWeight: '500',
  },
  playerInput: {
    flex: 1,
    backgroundColor: '#2f313a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
  },
  playerInputLocked: {
    backgroundColor: '#1e1f23',
    color: '#888',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  addRowBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3c43',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 4,
  },
  addRowBtnText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },

  // ── Create Button ──
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2c30',
  },
  createBtn: {
    backgroundColor: '#fcb93c',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createBtnWide: {
    backgroundColor: '#fcb93c',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  createBtnText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
  },
});
