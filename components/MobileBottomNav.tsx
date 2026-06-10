import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from './Icon';

type PanelTab = 'players' | 'roles' | 'notes';

interface MobileBottomNavProps {
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  layout: 'circle' | 'room';
  editMode: boolean;
  onToggleEdit: () => void;
  onToggleLayout: () => void;
}

const TABS: { key: PanelTab; label: string; iconName: string }[] = [
  { key: 'players', label: 'Players', iconName: 'users' },
  { key: 'roles', label: 'Roles', iconName: 'book' },
  { key: 'notes', label: 'Notes', iconName: 'edit3' },
];

export default function MobileBottomNav({
  activeTab,
  onTabChange,
  layout,
  editMode,
  onToggleEdit,
  onToggleLayout,
}: MobileBottomNavProps) {
  return (
    <View style={styles.container}>
      {/* Quick action row */}
      <View style={styles.quickActions}>
        <Pressable
          onPress={onToggleLayout}
          style={[styles.quickBtn, layout === 'room' && styles.quickBtnActive]}
        >
          <Icon name={layout === 'circle' ? 'circle' : 'square'} size={18} color="#ccc" />
        </Pressable>

        <Pressable
          onPress={onToggleEdit}
          style={[styles.quickBtn, editMode && styles.editBtnActive]}
        >
          <Text style={styles.quickBtnText}>✏️</Text>
          {editMode && <Text style={styles.editLabel}>EDIT</Text>}
        </Pressable>
      </View>

      {/* Tab row */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => onTabChange(tab.key)}
          >
            <Icon name={tab.iconName} size={20} color={activeTab === tab.key ? '#fcb93c' : '#888'} />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1b1e',
    borderTopWidth: 1,
    borderTopColor: '#2f313a',
    paddingBottom: 20, // safe area
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2c30',
  },
  quickBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnActive: {
    backgroundColor: '#1e3a5f',
  },
  quickBtnText: {
    fontSize: 16,
  },
  editBtnActive: {
    backgroundColor: '#fcb93c',
  },
  editLabel: {
    position: 'absolute',
    bottom: -8,
    color: '#fcb93c',
    fontSize: 8,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 1,
  },
  tabActive: {},
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#fcb93c',
    fontWeight: '700',
  },
});
