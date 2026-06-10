import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getRoles, TEAM_COLORS, TEAM_ORDER } from '../data/roles';
import { getScriptRoles } from '../data/scripts';
import RoleCard from './RoleCard';
import RoleIcon from './RoleIcon';
import ScriptSearchPanel from './ScriptSearchPanel';

type ViewMode = 'all' | 'script' | 'night' | 'search';

interface RoleBrowserProps {
  scriptId: string | null;
  onSelectRole?: (roleId: string) => void;
  onClose?: () => void;
  onImportScript?: (name: string, roleIds: string[]) => void;
  onClearScript?: () => void;
}

export default function RoleBrowser({
  scriptId,
  onSelectRole,
  onClose,
  onImportScript,
  onClearScript,
}: RoleBrowserProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);


  const scriptRoleIds = useMemo(
    () => (scriptId ? getScriptRoles(scriptId) : []),
    [scriptId]
  );

  const filteredRoles = useMemo(() => {
    let roles = Object.values(getRoles());

    // Filter by view mode
    if (viewMode === 'script' && scriptRoleIds.length > 0) {
      roles = roles.filter(r => scriptRoleIds.includes(r.id));
    }

    // Filter by team
    if (selectedTeam) {
      roles = roles.filter(r => r.team === selectedTeam);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      roles = roles.filter(
        r =>
          r.name.toLowerCase().includes(q) ||
          r.ability.toLowerCase().includes(q) ||
          r.team.toLowerCase().includes(q)
      );
    }

    // Sort by team order then name
    roles.sort((a, b) => {
      const ta = TEAM_ORDER[a.team] ?? 99;
      const tb = TEAM_ORDER[b.team] ?? 99;
      if (ta !== tb) return ta - tb;
      return a.name.localeCompare(b.name);
    });

    return roles;
  }, [viewMode, scriptRoleIds, selectedTeam, search]);

  const roleTeams = useMemo(() => {
    const teams = new Set(Object.values(getRoles()).map(r => r.team));
    return Array.from(teams).sort(
      (a, b) => (TEAM_ORDER[a] ?? 99) - (TEAM_ORDER[b] ?? 99)
    );
  }, []);

  // Night order roles
  const nightRoles = useMemo(() => {
    const firstNight = Object.values(getRoles())
      .filter(r => r.firstNight !== undefined)
      .sort((a, b) => (a.firstNight ?? 0) - (b.firstNight ?? 0));

    const otherNight = Object.values(getRoles())
      .filter(r => r.otherNight !== undefined)
      .sort((a, b) => (a.otherNight ?? 0) - (b.otherNight ?? 0));

    return { firstNight, otherNight };
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Roles</Text>
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* View mode tabs */}
        <View style={styles.tabRow}>
          {([
            { key: 'all' as const, label: 'All' },
            { key: 'script' as const, label: 'Script' },
            { key: 'search' as const, label: 'Search' },
            { key: 'night' as const, label: 'Night Order' },
          ]).map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tab, viewMode === tab.key && styles.tabActive]}
              onPress={() => setViewMode(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  viewMode === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Search */}
        {viewMode !== 'night' && (
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search roles..."
            placeholderTextColor="#555"
          />
        )}
      </View>

      {viewMode === 'search' ? (
        <View style={{ flex: 1 }}>
          <ScriptSearchPanel
            currentScriptId={scriptId}
            onImportScript={onImportScript || (() => {})}
            onClearScript={onClearScript || (() => {})}
          />
        </View>
      ) : (
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {/* Night Order View */}
        {viewMode === 'night' ? (
          <>
            {nightRoles.firstNight.length > 0 && (
              <View style={styles.nightSection}>
                <Text style={styles.nightSectionTitle}>🌙 First Night</Text>
                {nightRoles.firstNight.map(role => (
                  <View key={role.id} style={styles.nightRow}>
                    <View style={styles.nightNum}>
                      <Text style={styles.nightNumText}>{role.firstNight}</Text>
                    </View>
                    <RoleIcon roleId={role.id} team={role.team} size={20} showBorder={false} />
                    <Text style={styles.nightRoleName}>{role.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {nightRoles.otherNight.length > 0 && (
              <View style={styles.nightSection}>
                <Text style={styles.nightSectionTitle}>🌙 Other Nights</Text>
                {nightRoles.otherNight.map(role => (
                  <View key={role.id} style={styles.nightRow}>
                    <View style={styles.nightNum}>
                      <Text style={styles.nightNumText}>{role.otherNight}</Text>
                    </View>
                    <RoleIcon roleId={role.id} team={role.team} size={20} showBorder={false} />
                    <Text style={styles.nightRoleName}>{role.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            {/* Team filter chips */}
            <View style={styles.teamFilterRow}>
              <Pressable
                style={[
                  styles.teamChip,
                  selectedTeam === null && styles.teamChipActive,
                ]}
                onPress={() => setSelectedTeam(null)}
              >
                <Text
                  style={[
                    styles.teamChipText,
                    selectedTeam === null && styles.teamChipTextActive,
                  ]}
                >
                  All
                </Text>
              </Pressable>
              {roleTeams.map(team => (
                <Pressable
                  key={team}
                  style={[
                    styles.teamChip,
                    selectedTeam === team && {
                      borderColor: TEAM_COLORS[team],
                      backgroundColor: TEAM_COLORS[team] + '22',
                    },
                  ]}
                  onPress={() =>
                    setSelectedTeam(selectedTeam === team ? null : team)
                  }
                >
                  <Text
                    style={[
                      styles.teamChipText,
                      selectedTeam === team && {
                        color: TEAM_COLORS[team],
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {team.charAt(0).toUpperCase() + team.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Role cards */}
            {filteredRoles.map(role => (
              <RoleCard
                key={role.id}
                role={role}
                onSelect={onSelectRole || undefined}
              />
            ))}

            {filteredRoles.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {scriptId && viewMode === 'script'
                    ? 'No roles found for this script'
                    : 'No roles match your search'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1f23',
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2f313a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#aaa',
    fontSize: 14,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#2f313a',
  },
  tabActive: {
    backgroundColor: '#1e3a5f',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#2f313a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  teamFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  teamChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#2f313a',
    borderWidth: 1,
    borderColor: '#3a3c43',
  },
  teamChipActive: {
    borderColor: '#fcb93c',
  },
  teamChipText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
  },
  teamChipTextActive: {
    color: '#fcb93c',
  },

  nightSection: {
    padding: 12,
  },
  nightSectionTitle: {
    color: '#fbbf24',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  nightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#282a2e',
  },
  nightNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3a2f1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  nightNumText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
  },
  teamBadge: {
    fontSize: 18,
    marginRight: 10,
  },
  nightRoleName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
});
