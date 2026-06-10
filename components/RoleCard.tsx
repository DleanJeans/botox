import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TEAM_COLORS } from '../data/roles';
import type { Role } from '../types';
import RoleIcon from './RoleIcon';

interface Props {
  role: Role;
  onSelect?: (roleId: string) => void;
}

export default function RoleCard({ role, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      style={[
        styles.card,
        expanded && styles.cardExpanded,
      ]}
      onPress={() => {
        if (onSelect) {
          onSelect(role.id);
        } else {
          setExpanded(!expanded);
        }
      }}
    >
      <View style={styles.header}>
        <RoleIcon roleId={role.id} team={role.team} size={24} showBorder />
        <View style={styles.info}>
          <Text style={styles.name}>{role.name}</Text>
          <Text
            style={[
              styles.team,
              {
                color: TEAM_COLORS[role.team] || '#aaa',
              },
            ]}
          >
            {role.team.charAt(0).toUpperCase() + role.team.slice(1)}
          </Text>
        </View>
      </View>

      {(expanded || (!onSelect && expanded)) && (
        <View style={styles.details}>
          <Text style={styles.ability}>{role.ability}</Text>
          {role.reminder && (
            <Text style={styles.reminder}>💡 {role.reminder}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2f313a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  cardExpanded: {
    backgroundColor: '#35373d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  team: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  details: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#3a3c43',
  },
  ability: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 18,
  },
  reminder: {
    color: '#888',
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
