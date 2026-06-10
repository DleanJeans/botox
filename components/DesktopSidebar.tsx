import { useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { TEAMS } from '../constants';
import { getRoles, TEAM_COLORS } from "../data/roles";
import { useGameStore } from '../hooks/useGameStore';
import type { Game, Player } from "../types";
import RoleIcon from "./RoleIcon";
import ScriptSearchPanel from "./ScriptSearchPanel";

type PanelTab = 'players' | 'roles' | 'night' | 'notes' | 'search';

interface DesktopSidebarProps {
  game: Game;
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  onPlayerPress: (playerId: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
  onToggleAlive: (playerId: string) => void;
  onImportScript: (scriptName: string, roleIds: string[]) => void;
  onClearScript: () => void;
}

const TABS: { key: PanelTab; label: string; icon: string }[] = [
  { key: 'players', label: 'Players', icon: '👥' },
  { key: 'roles', label: 'Roles', icon: '📖' },
  { key: 'search', label: 'Search', icon: '🔍' },
  { key: 'night', label: 'Night', icon: '🌙' },
  { key: 'notes', label: 'Notes', icon: '📝' },
];

export default function DesktopSidebar({
  game,
  activeTab,
  onTabChange,
  onPlayerPress,
  onAddPlayer,
  onRemovePlayer,
  onToggleAlive,
  onImportScript,
  onClearScript,
}: DesktopSidebarProps) {
  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Panel content */}
      <View style={styles.panel}>
        {activeTab === 'players' && (
          <PlayersPanel
            players={game.players}
            onPlayerPress={onPlayerPress}
            onAddPlayer={onAddPlayer}
            onRemovePlayer={onRemovePlayer}
            onToggleAlive={onToggleAlive}
          />
        )}
        {activeTab === 'roles' && <RolesPanel />}
        {activeTab === 'night' && <NightPanel game={game} />}
        {activeTab === 'search' && (
          <ScriptSearchPanel
            currentScriptId={game.scriptId}
            onImportScript={onImportScript}
            onClearScript={onClearScript}
          />
        )}
        {activeTab === 'notes' && <NotesPanel />}
      </View>
    </View>
  );
}

// ─── Players Panel ──────────────────────────────────────────────
function PlayersPanel({
  players,
  onPlayerPress,
  onAddPlayer,
  onRemovePlayer,
  onToggleAlive,
}: {
  players: Player[];
  onPlayerPress: (id: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (id: string) => void;
  onToggleAlive: (id: string) => void;
}) {
  return (
    <View style={styles.panelContent}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Players ({players.length})</Text>
        <Pressable onPress={onAddPlayer} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {players.length === 0 ? (
          <Text style={styles.emptyText}>No players yet</Text>
        ) : (
          players.map((player, i) => (
            <View key={player.id} style={styles.playerRow}>
              <Pressable
                style={styles.playerInfo}
                onPress={() => onPlayerPress(player.id)}
              >
                <View style={[styles.playerDot, { backgroundColor: player.isAlive ? '#22c55e' : '#666' }]} />
                <View style={styles.playerMeta}>
                  <Text style={[styles.playerName, !player.isAlive && styles.deadName]}>
                    {i + 1}. {player.name}
                  </Text>
                  <Text style={styles.playerSub}>
                    {player.isAlive ? '❤️' : '💀'}
                    {player.guessedRole ? ` · guess` : ''}
                    {player.suspicion > 0 ? ` · ${'🟢🟡🔴'[player.suspicion - 1]}` : ''}
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={() => onToggleAlive(player.id)} style={styles.toggleBtn}>
                <Text style={styles.toggleBtnText}>{player.isAlive ? '💀' : '❤️'}</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Roles Panel ────────────────────────────────────────────────
function RolesPanel() {
  
  const rolesByTeam = TEAMS.map((team) => ({
			team,
			roles: Object.values(getRoles()).filter((r) => r.team === team),
		}));
  const [search, setSearch] = useState('');

  const filtered = search.trim()
			? Object.values(getRoles()).filter(
					(r) =>
						r.name.toLowerCase().includes(search.toLowerCase()) ||
						r.ability.toLowerCase().includes(search.toLowerCase()),
				)
			: null;

  return (
    <View style={styles.panelContent}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Role Reference</Text>
      </View>
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Search roles..."
        placeholderTextColor="#555"
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {(filtered || rolesByTeam.flatMap(t => t.roles)).map(role => (
          <View key={role.id} style={styles.roleCard}>
            <View style={styles.roleCardHeader}>
              <RoleIcon roleId={role.id} team={role.team} size={28} showBorder={false} />
              <View style={styles.roleCardMeta}>
                <Text style={styles.roleName}>{role.name}</Text>
                <Text style={[styles.roleTeam, { color: TEAM_COLORS[role.team] }]}>
                  {role.team}
                  {role.firstNight ? ` · Night ${role.firstNight}` : ''}
                  {role.otherNight ? ` · Night ${role.otherNight}` : ''}
                </Text>
              </View>
            </View>
            <Text style={styles.roleAbility}>{role.ability}</Text>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ─── Night Panel ────────────────────────────────────────────────
function NightPanel({ game }: { game: Game }) {
  // Collect all roles that have night actions
		const nightRoles = game.players
			.filter((p) => p.guessedRole && getRoles()[p.guessedRole])
			.map((p) => ({
				playerName: p.name,
				role: getRoles()[p.guessedRole!],
			}))
			.filter(({ role }) => role.firstNight || role.otherNight)
			.sort((a, b) => {
				const aOrder =
					game.currentDay === 1
						? a.role.firstNight || 99
						: a.role.otherNight || 99;
				const bOrder =
					game.currentDay === 1
						? b.role.firstNight || 99
						: b.role.otherNight || 99;
				return aOrder - bOrder;
			});

  return (
    <View style={styles.panelContent}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>
          🌙 Night Order
        </Text>
      </View>
      <Text style={styles.dayText}>
        Day {game.currentDay}
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {nightRoles.length === 0 ? (
          <Text style={styles.emptyText}>
            No night-active roles detected. Set role guesses for your players to see the night order.
          </Text>
        ) : (
          nightRoles.map((item, i) => (
            <View key={i} style={styles.nightRow}>
              <View style={styles.nightOrderBadge}>
                <Text style={styles.nightOrderNum}>{i + 1}</Text>
              </View>
              <View style={styles.nightInfo}>
                <Text style={styles.nightPlayer}>{item.playerName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <RoleIcon roleId={item.role.id} team={item.role.team} size={16} showBorder={false} />
                  <Text style={styles.nightRole}>
                    {item.role.name}
                  </Text>
                </View>
              </View>
              <Text style={styles.nightAbility}>{item.role.ability.substring(0, 60)}</Text>
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ─── Notes Panel ────────────────────────────────────────────────
function NotesPanel() {
  const games = useGameStore(s => s.games);
  const currentGameId = useGameStore(s => s.currentGameId);
  const setGameNotes = useGameStore(s => s.setGameNotes);
  const game = games.find(g => g.id === currentGameId);
  const notes = (game as any)?.gameNotes || '';

  return (
    <View style={styles.panelContent}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Game Journal</Text>
      </View>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setGameNotes}
        placeholder="Write your deductions, suspicions, and strategies here..."
        placeholderTextColor="#555"
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#1e1f23',
    borderRightWidth: 1,
    borderRightColor: '#2f313a',
    flexDirection: 'column',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2f313a',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#fcb93c',
  },
  tabIcon: {
    fontSize: 16,
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
  panel: {
    flex: 1,
  },
  panelContent: {
    flex: 1,
    padding: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fcb93c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  searchInput: {
    backgroundColor: '#2f313a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 13,
    marginBottom: 12,
  },
  // Players panel
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2c30',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  playerMeta: {
    flex: 1,
  },
  playerName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  deadName: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  playerSub: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  toggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  toggleBtnText: {
    fontSize: 14,
  },
  // Roles panel
  roleCard: {
    backgroundColor: '#2f313a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  roleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  roleEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  roleCardMeta: {
    flex: 1,
  },
  roleName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  roleTeam: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  roleAbility: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 17,
  },
  // Night panel
  dayText: {
    color: '#888',
    fontSize: 13,
    marginBottom: 12,
  },
  nightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2c30',
  },
  nightOrderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2f313a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  nightOrderNum: {
    color: '#fcb93c',
    fontSize: 12,
    fontWeight: '700',
  },
  nightInfo: {
    width: 90,
    marginRight: 8,
  },
  nightPlayer: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  nightRole: {
    color: '#aaa',
    fontSize: 11,
  },
  nightAbility: {
    flex: 1,
    color: '#888',
    fontSize: 11,
    lineHeight: 15,
  },
  // Notes panel
  notesInput: {
    backgroundColor: '#2f313a',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 13,
    minHeight: 200,
    lineHeight: 20,
  },
});
