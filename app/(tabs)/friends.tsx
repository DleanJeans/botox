import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContentWrapper from '../../components/ContentWrapper';
import Icon from '../../components/Icon';
import { useFriendStore } from '../../hooks/useFriendStore';
import { useResponsive } from '../../hooks/useResponsive';

export default function FriendsScreen() {
  const { friends, loadFriends, addFriend, deleteFriend } = useFriendStore();
  const { isLandscape, isDesktop } = useResponsive();
  const isWide = isLandscape || isDesktop;
  const [newName, setNewName] = useState('');
  const [filter, setFilter] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadFriends();
  }, [
    loadFriends,
  ]);

  const trimmedName = newName.trim();
  const isDuplicate =
    trimmedName.length > 0 &&
    friends.some(f => f.name.toLowerCase() === trimmedName.toLowerCase());

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (isDuplicate) return;
    addFriend(name, '');
    setNewName('');
    // Keep input focused for quick multi-entry
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = (id: string, name: string) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm(`Remove "${name}"?`)) return;
      deleteFriend(id);
    }
  };

  const filtered = filter.trim()
    ? friends.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()))
    : friends;

  return (
    <SafeAreaView style={styles.container}>
      <ContentWrapper isWide={isWide} maxWidth={600}>
        {/* Quick-add input */}
        <View style={styles.addRow}>
          <TextInput
            ref={inputRef}
            style={[
              styles.addInput,
              isDuplicate && styles.addInputError,
            ]}
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            blurOnSubmit={false}
            autoFocus
          />
        </View>
        {isDuplicate && (
          <Text style={styles.duplicateWarning}>
            ⚠ "{trimmedName}" is already on your friends list
          </Text>
        )}

        {/* Friend count / filter */}
        {friends.length > 0 && (
          <View style={styles.metaRow}>
            <Text style={styles.count}>
              {friends.length} friend{friends.length !== 1 ? 's' : ''}
            </Text>
            {friends.length > 5 && (
              <TextInput
                style={styles.filterInput}
                value={filter}
                onChangeText={setFilter}
                placeholder="Filter..."
                placeholderTextColor="#555"
              />
            )}
          </View>
        )}

        {/* Friend list or empty state */}
        {friends.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="users" size={64} color="#555" />
            <Text style={styles.emptyTitle}>No friends yet</Text>
            <Text style={styles.emptySubtitle}>
              Type a name above and press Enter to add someone
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.friendRow}>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{item.name}</Text>
                  <Text style={styles.friendMeta}>
                    Played {item.gameCount} time
                    {item.gameCount !== 1 ? 's' : ''}
                    {item.lastPlayed
                      ? ` · Last: ${new Date(item.lastPlayed).toLocaleDateString()}`
                      : ' · Never played'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDelete(item.id, item.name)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </ContentWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
  },
  addRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2c30',
  },
  addInput: {
    flex: 1,
    backgroundColor: '#2f313a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  addInputError: {
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  duplicateWarning: {
    color: '#f59e0b',
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  count: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  filterInput: {
    backgroundColor: '#2f313a',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#fff',
    fontSize: 13,
    width: 120,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2f313a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  friendMeta: {
    color: '#888',
    fontSize: 12,
    marginTop: 3,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
