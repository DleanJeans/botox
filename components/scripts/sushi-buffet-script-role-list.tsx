import { Search } from 'lucide-react-native';
import { type ReactElement, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ScriptRoleList } from '@/components/scripts/script-role-list';
import { Text, TextInput } from '@/components/text';
import { colors } from '@/theme/colors';
import type { Role } from '@/types/game';

const ROLE_TEAM_FILTERS = [
  { label: 'Townsfolks', team: 'townsfolk' },
  { label: 'Outsiders', team: 'outsider' },
  { label: 'Minions', team: 'minion' },
  { label: 'Demons', team: 'demon' },
] as const;

type SushiBuffetRoleTeam = (typeof ROLE_TEAM_FILTERS)[number]['team'];

export function SushiBuffetScriptRoleList({
  header,
  roleCatalog,
  roles,
  scriptId,
}: {
  header: ReactElement;
  roleCatalog: Role[];
  roles: Role[];
  scriptId: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<SushiBuffetRoleTeam>('townsfolk');
  const filteredRoles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    return roles.filter((role) => {
      const matchesTeam = role.team?.toLocaleLowerCase() === selectedTeam;
      const matchesSearch =
        !normalizedQuery ||
        role.name.toLocaleLowerCase().includes(normalizedQuery) ||
        role.id.toLocaleLowerCase().includes(normalizedQuery);

      return matchesTeam && matchesSearch;
    });
  }, [roles, searchQuery, selectedTeam]);

  return (
    <ScriptRoleList
      header={
        <View style={styles.headerContent}>
          {header}
          <View style={styles.filters}>
            <Search color={colors.textMuted} size={18} strokeWidth={2.4} />
            <TextInput
              accessibilityLabel="Search Sushi Buffet roles"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setSearchQuery}
              placeholder="Search roles"
              placeholderTextColor={colors.textSubtle}
              returnKeyType="search"
              style={styles.searchInput}
              value={searchQuery}
            />
          </View>
          <View accessibilityRole="tablist" style={styles.tabs}>
            {ROLE_TEAM_FILTERS.map(({ label, team }) => (
              <SushiBuffetRoleTeamTab
                key={team}
                label={label}
                onPress={() => setSelectedTeam(team)}
                selected={selectedTeam === team}
              />
            ))}
          </View>
        </View>
      }
      roleCatalog={roleCatalog}
      roles={filteredRoles}
      scriptId={scriptId}
    />
  );
}

function SushiBuffetRoleTeamTab({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={`Show ${label.toLocaleLowerCase()} roles`}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        pressed && styles.tabPressed,
        selected && styles.tabSelected,
      ]}
    >
      <Text selectable style={[styles.tabText, selected && styles.tabTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filters: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  headerContent: {
    gap: 10,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    minHeight: 42,
    paddingVertical: 10,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 4,
  },
  tabPressed: {
    backgroundColor: colors.surfacePressed,
  },
  tabSelected: {
    backgroundColor: colors.inputText,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  tabTextSelected: {
    color: colors.onPrimary,
  },
  tabs: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    overflow: 'hidden',
    padding: 4,
  },
});
