import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ROLES, TEAM_COLORS, TEAM_ORDER } from '../data/roles';
import { TEAMS } from '../constants';
import RoleIcon from '../components/RoleIcon';

interface Props {
  name: string;
  roleIds: string[];
  onClose: () => void;
}

export default function ScriptDetailPanel({ name, roleIds, onClose }: Props) {
  const grouped = TEAMS
    .map(team => ({
      team,
      roles: roleIds
        .map(id => ROLES[id])
        .filter((r): r is NonNullable<typeof r> => r !== undefined && r.team === team),
    }))
    .filter(g => g.roles.length > 0)
    .sort((a, b) => (TEAM_ORDER[a.team] ?? 99) - (TEAM_ORDER[b.team] ?? 99));

  const unknownCount = roleIds.filter(id => !ROLES[id]).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>{roleIds.length} roles</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {grouped.map(group => (
          <View key={group.team}>
            <Text style={[styles.teamLabel, { color: TEAM_COLORS[group.team] }]}>
              {group.team.charAt(0).toUpperCase() + group.team.slice(1)} ({group.roles.length})
            </Text>
            {group.roles.map(role => (
              <View key={role.id} style={styles.roleRow}>
                <RoleIcon roleId={role.id} team={role.team} size={36} circular showBorder />
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName} numberOfLines={1}>{role.name}</Text>
                  <Text style={styles.roleAbility} numberOfLines={2}>{role.ability}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
        {unknownCount > 0 && (
          <Text style={styles.unknownText}>{unknownCount} unknown role{unknownCount > 1 ? 's' : ''}</Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320, backgroundColor: '#1e1f23', borderLeftWidth: 1, borderLeftColor: '#2f313a',
    padding: 16, paddingTop: 20,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1 },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#2f313a',
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  subtitle: { color: '#888', fontSize: 12, marginBottom: 16 },
  teamLabel: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginTop: 14, marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#2a2c30', gap: 10,
  },
  roleInfo: { flex: 1 },
  roleName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  roleAbility: { color: '#aaa', fontSize: 11, lineHeight: 15, marginTop: 1 },
  unknownText: { color: '#666', fontSize: 11, textAlign: 'center', marginTop: 12 },
});
