import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';

interface GameHeaderProps {
  title: string;
  layout: 'circle' | 'room';
  playerDraggable: boolean;
  roomDraggable: boolean;
  playerCount: number;
  currentDay: number;
  onToggleLayout: () => void;
  onToggleEdit: () => void;
  onToggleRoomDrag: () => void;
  onBack: () => void;
  onAddPlayer: () => void;
}

export default function GameHeader({
  title,
  layout,
  playerDraggable,
  roomDraggable,
  playerCount,
  currentDay,
  onToggleLayout,
  onToggleEdit,
  onToggleRoomDrag,
  onBack,
  onAddPlayer,
}: GameHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Top row */}
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            {playerCount} player{playerCount !== 1 ? 's' : ''} · Day{' '}
            {currentDay}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={onToggleLayout}
          style={[
            styles.actionBtn,
            layout === 'room' && styles.actionBtnActive,
          ]}
        >
          <Icon
            name={layout === 'circle' ? 'circle' : 'square'}
            size={16}
            color="#ccc"
          />
          <Text style={styles.actionLabel}>
            {layout === 'circle' ? 'Circle' : 'Room'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onToggleRoomDrag}
          style={[
            styles.actionBtn,
            roomDraggable && styles.actionBtnDrag,
          ]}
        >
          <Icon name="move" size={16} color={roomDraggable ? '#000' : '#ccc'} />
          <Text
            style={[
              styles.actionLabel,
              roomDraggable && styles.actionLabelEdit,
            ]}
          >
            {roomDraggable ? 'Save Room Position' : 'Move Room'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onToggleEdit}
          style={[
            styles.actionBtn,
            playerDraggable && styles.actionBtnEdit,
          ]}
        >
          <Icon
            name="pencil"
            size={16}
            color={playerDraggable ? '#000' : '#ccc'}
          />
          <Text
            style={[
              styles.actionLabel,
              playerDraggable && styles.actionLabelEdit,
            ]}
          >
            {playerDraggable ? 'Save Players Position' : 'Move Players'}
          </Text>
        </Pressable>

        <Pressable onPress={onAddPlayer} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1b1e',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2f313a',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  titleArea: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2f313a',
    gap: 4,
  },
  actionBtnActive: {
    backgroundColor: '#1e3a5f',
  },
  actionBtnEdit: {
    backgroundColor: '#fcb93c',
  },
  actionBtnDrag: {
    backgroundColor: '#818cf8',
  },
  actionIcon: {
    fontSize: 14,
  },
  actionLabel: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },
  actionLabelEdit: {
    color: '#000',
    fontWeight: '700',
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#166534',
    marginLeft: 'auto',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
