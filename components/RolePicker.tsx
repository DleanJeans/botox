import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TEAMS } from '../constants';
import { getRoles, TEAM_COLORS, TEAM_ORDER } from '../data/roles';
import RoleIcon from './RoleIcon';

interface Props {
  currentRoleId: string | null;
  scriptRoleIds?: string[];
  onSelect: (roleId: string) => void;
  onClear?: () => void;
}

export default function RolePicker({
  currentRoleId,
  scriptRoleIds,
  onSelect,
}: Props) {
  // Get all roles, filtered by script if available
  const allRoles = Object.values(getRoles());
  const hasScript = scriptRoleIds && scriptRoleIds.length > 0;
  const filteredRoles = hasScript
    ? scriptRoleIds.map(id => getRoles()[id]).filter(Boolean)
    : allRoles;

  // Group by team

  const grouped = TEAMS.map(team => ({
    team,
    roles: filteredRoles
      .filter(r => r.team === team)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))
    .filter(g => g.roles.length > 0)
    .sort((a, b) => (TEAM_ORDER[a.team] ?? 99) - (TEAM_ORDER[b.team] ?? 99));

  return (
    <View style={styles.grid}>
      {grouped.map(group => (
        <View key={group.team}>
          <Text
            style={[
              styles.teamLabel,
              {
                color: TEAM_COLORS[group.team] || '#fff',
              },
            ]}
          >
            {group.team.charAt(0).toUpperCase() + group.team.slice(1)}
          </Text>
          <View style={styles.row}>
            {group.roles.map(role => {
              const active = currentRoleId === role.id;
              return (
                <Pressable
                  key={role.id}
                  style={[
                    styles.chip,
                    active && styles.chipActive,
                  ]}
                  onPress={() => onSelect(role.id)}
                >
                  <RoleIcon
                    roleId={role.id}
                    team={role.team}
                    size={16}
                    showBorder={false}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      active && styles.chipTextActive,
                    ]}
                  >
                    {role.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#2f313a',
    borderWidth: 1,
    borderColor: '#3a3c43',
  },
  chipActive: {
    borderColor: '#fcb93c',
    backgroundColor: '#3a2f1a',
  },
  chipText: {
    color: '#ddd',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#fcb93c',
    fontWeight: '700',
  },
});
