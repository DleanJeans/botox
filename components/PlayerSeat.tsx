import { useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Player } from '../types';

interface PlayerSeatProps {
  player: Player;
  size: number;
  editMode: boolean;
  panX?: number;
  panY?: number;
  onPress: () => void;
  onDragStart: () => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: () => void;
}

const AVATAR_COLORS = [
  '#3492ea',
  '#22c55e',
  '#eab308',
  '#ef4444',
  '#c084fc',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
];

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  );
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function PlayerSeat({
  player,
  size,
  editMode,
  panX = 0,
  panY = 0,
  onPress,
  onDragStart,
  onDragMove,
  onDragEnd,
}: PlayerSeatProps) {
  // Use refs to keep latest callbacks without recreating PanResponder
  const callbacks = useRef({
    onDragStart,
    onDragMove,
    onDragEnd,
    editMode,
  });
  callbacks.current = {
    onDragStart,
    onDragMove,
    onDragEnd,
    editMode,
  };

  const dragOffset = useRef({
    x: 0,
    y: 0,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => callbacks.current.editMode,
      onStartShouldSetPanResponderCapture: () => callbacks.current.editMode,
      onMoveShouldSetPanResponder: () => callbacks.current.editMode,
      onMoveShouldSetPanResponderCapture: () => callbacks.current.editMode,
      onPanResponderGrant: evt => {
        const { pageX, pageY } = evt.nativeEvent;
        dragOffset.current = {
          x: pageX - player.position.x + panX,
          y: pageY - player.position.y + panY,
        };
        callbacks.current.onDragStart();
      },
      onPanResponderMove: evt => {
        const { pageX, pageY } = evt.nativeEvent;
        callbacks.current.onDragMove(
          pageX - dragOffset.current.x - panX,
          pageY - dragOffset.current.y - panY,
        );
      },
      onPanResponderRelease: () => {
        callbacks.current.onDragEnd();
      },
      onPanResponderTerminate: () => {
        callbacks.current.onDragEnd();
      },
    }),
  ).current;

  const suspicionColors = [
    '#555',
    '#22c55e',
    '#eab308',
    '#ef4444',
  ];

  return (
    <View
      style={[
        styles.container,
        {
          left: player.position.x - size / 2,
          top: player.position.y - size / 2,
          width: size,
          height: size,
          opacity: player.isAlive ? 1 : 0.5,
          zIndex: 10,
        },
      ]}
      {...(editMode ? panResponder.panHandlers : {})}
    >
      <Pressable
        onPress={editMode ? undefined : onPress}
        style={({ pressed }) => [
          styles.seat,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: player.isAlive
              ? suspicionColors[player.suspicion]
              : '#333',
            backgroundColor: player.isAlive
              ? 'rgba(47, 49, 54, 0.95)'
              : 'rgba(30, 30, 35, 0.8)',
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        {/* Ghost vote indicator */}
        {player.isGhostVote && (
          <View style={styles.ghostBadge}>
            <Text style={styles.ghostText}>👻</Text>
          </View>
        )}

        {/* Avatar circle with initials */}
        <View
          style={[
            styles.avatar,
            {
              width: size * 0.45,
              height: size * 0.45,
              borderRadius: size * 0.225,
              backgroundColor: getAvatarColor(player.name),
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: size * 0.18,
              },
            ]}
          >
            {getInitials(player.name)}
          </Text>
        </View>

        {/* Player name */}
        <Text
          style={[
            styles.name,
            !player.isAlive && styles.dead,
          ]}
          numberOfLines={1}
        >
          {player.name}
        </Text>

        {/* Suspicion indicator */}
        {player.suspicion > 0 && (
          <Text style={styles.suspicionBadge}>
            {player.suspicion === 1
              ? '🟢'
              : player.suspicion === 2
                ? '🟡'
                : '🔴'}
          </Text>
        )}

        {/* Death indicator */}
        {!player.isAlive && (
          <View style={styles.deadOverlay}>
            <Text style={styles.deadIcon}>💀</Text>
          </View>
        )}

        {/* Edit mode drag handle */}
        {editMode && (
          <View style={styles.dragHandle}>
            <Text style={styles.dragHandleText}>↕</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    elevation: 5,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.3)',
  },
  seat: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    padding: 4,
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
  name: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: '100%',
    paddingHorizontal: 2,
  },
  dead: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  suspicionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 14,
  },
  deadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 999,
  },
  deadIcon: {
    fontSize: 24,
  },
  ghostBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 10,
  },
  ghostText: {
    fontSize: 12,
  },
  dragHandle: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fcb93c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandleText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
