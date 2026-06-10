import { useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import RoleIcon from '../components/RoleIcon';
import { TEAMS } from '../constants';
import { getRoles, TEAM_COLORS } from '../data/roles';

export default function CreateScriptModal({ visible, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const searchRef = useRef<TextInput>(null);
  const [gridWidth, setGridWidth] = useState(0);
  const [search, setSearch] = useState('');
  const MIN_CARD_WIDTH = 175;

  const numColumns = useMemo(() => {
    if (!gridWidth) return 2;
    return Math.max(1, Math.floor(gridWidth / MIN_CARD_WIDTH));
  }, [
    gridWidth,
  ]);

  const cardWidth = useMemo(() => {
    if (!gridWidth || numColumns === 0) return 0;
    const totalGap = (numColumns - 1) * 6;
    return (gridWidth - totalGap) / numColumns;
  }, [
    gridWidth,
    numColumns,
  ]);

  const rolesByTeam = useMemo(() => {
    const list = Object.values(getRoles());
    return TEAMS.map(team => ({
      team,
      roles: list
        .filter(r => r.team === team)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, []);

  const toggleRole = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const handleSave = () => {
    if (!name.trim() || selected.size === 0) return;
    onSave(name.trim(), Array.from(selected));
    setName('');
    setSelected(new Set());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Script</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Name input */}
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Script name"
            placeholderTextColor="#555"
          />

          {/* Search */}
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Filter roles..."
            placeholderTextColor="#555"
            blurOnSubmit={false}
            onSubmitEditing={() => {
              // Select first filtered role on Enter
              const allRoles = Object.values(getRoles()).filter(r =>
                r.name.toLowerCase().includes(search.toLowerCase()),
              );
              if (allRoles.length > 0) {
                const first = allRoles[0];
                const next = new Set(selected);
                if (next.has(first.id)) next.delete(first.id);
                else next.add(first.id);
                setSelected(next);
                // Refocus after state update
                setTimeout(() => searchRef.current?.focus(), 0);
                setTimeout(() => setSearch(''), 100);
              }
            }}
          />

          {/* Selected count + save */}
          {selected.size > 0 && (
            <View style={styles.selectionBar}>
              <Text style={styles.selectionText}>
                {selected.size} role{selected.size > 1 ? 's' : ''} selected
              </Text>
              <Pressable
                style={[
                  styles.saveBtn,
                  !name.trim() && styles.saveBtnDisabled,
                ]}
                onPress={handleSave}
                disabled={!name.trim()}
              >
                <Text style={styles.saveBtnText}>Save Script</Text>
              </Pressable>
            </View>
          )}

          {/* Role grid */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {rolesByTeam.map(({ team, roles }) => {
              const filtered = search.trim()
                ? roles.filter(r =>
                    r.name.toLowerCase().includes(search.toLowerCase()),
                  )
                : roles;
              if (filtered.length === 0) return null;
              return (
                <View key={team}>
                  <Text
                    style={[
                      styles.teamLabel,
                      {
                        color: TEAM_COLORS[team],
                      },
                    ]}
                  >
                    {team.charAt(0).toUpperCase() + team.slice(1)} (
                    {filtered.length})
                  </Text>
                  <View
                    style={styles.roleGrid}
                    onLayout={e => setGridWidth(e.nativeEvent.layout.width)}
                  >
                    {filtered.map(role => {
                      const isSelected = selected.has(role.id);
                      return (
                        <Pressable
                          key={role.id}
                          style={[
                            styles.roleCard,
                            {
                              width: cardWidth,
                            },
                            isSelected && styles.roleCardSelected,
                          ]}
                          onPress={() => toggleRole(role.id)}
                        >
                          <RoleIcon
                            roleId={role.id}
                            team={role.team}
                            size={36}
                            circular
                            showBorder
                          />
                          <Text
                            style={[
                              styles.roleName,
                              isSelected && styles.roleNameSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {role.name}
                          </Text>
                          {isSelected && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
            <View
              style={{
                height: 120,
              }}
            />
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
    height: '90%',
    paddingTop: 16,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nameInput: {
    backgroundColor: '#2f313a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#2a2c30',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 13,
    marginBottom: 12,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3a2f1a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  selectionText: {
    color: '#fcb93c',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#fcb93c',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  teamLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2f313a',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#3a3c43',
  },
  roleCardSelected: {
    borderColor: '#fcb93c',
    backgroundColor: '#3a2f1a',
  },
  roleName: {
    color: '#ccc',
    fontSize: 16,
  },
  roleNameSelected: {
    color: '#fcb93c',
    fontWeight: '600',
  },
  checkmark: {
    color: '#fcb93c',
    fontSize: 12,
    fontWeight: '700',
  },
});
