import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getRoles } from '../data/roles';
import {
  type BotcScriptResult,
  extractMeta,
  extractRoleIds,
  searchScripts,
} from '../hooks/useScriptSearch';
import RoleIcon from './RoleIcon';

interface ScriptSearchPanelProps {
  currentScriptId: string | null;
  onImportScript: (scriptName: string, roleIds: string[]) => void;
  onClearScript: () => void;
}

export default function ScriptSearchPanel({
  currentScriptId,
  onImportScript,
  onClearScript,
}: ScriptSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BotcScriptResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleSearch = useCallback(
    async (newPage = 1) => {
      if (!query.trim()) return;
      setLoading(true);
      setError('');
      try {
        const data = await searchScripts(query, newPage);
        setResults(data.results);
        setTotalCount(data.count);
        setPage(newPage);
      } catch (e: any) {
        setError(e.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    },
    [
      query,
    ],
  );

  const handleImport = useCallback(
    (script: BotcScriptResult) => {
      const roleIds = extractRoleIds(script.content);
      onImportScript(script.name, roleIds);
    },
    [
      onImportScript,
    ],
  );

  const matchedRoleCount = (roleIds: string[]) => {
    return roleIds.filter(id => getRoles()[id]).length;
  };

  return (
    <View style={styles.container}>
      {/* Current script indicator */}
      {currentScriptId && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>
            📜 Script: {currentScriptId}
          </Text>
          <Pressable onPress={onClearScript} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </Pressable>
        </View>
      )}

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search scripts by name, author..."
          placeholderTextColor="#555"
          onSubmitEditing={() => handleSearch(1)}
          returnKeyType="search"
        />
        <Pressable style={styles.searchBtn} onPress={() => handleSearch(1)}>
          <Text style={styles.searchBtnText}>Search</Text>
        </Pressable>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color="#fcb93c" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          <Text style={styles.resultCount}>
            {totalCount > 0 ? `${totalCount} scripts found` : ''}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {results.map(script => {
              const roleIds = extractRoleIds(script.content);
              const meta = extractMeta(script.content);
              const matched = matchedRoleCount(roleIds);
              const total = roleIds.length;

              return (
                <Pressable
                  key={script.pk}
                  style={styles.scriptCard}
                  onPress={() => handleImport(script)}
                >
                  <View style={styles.scriptHeader}>
                    <Text style={styles.scriptName}>{script.name}</Text>
                    <Text style={styles.scriptVersion}>v{script.version}</Text>
                  </View>
                  <Text style={styles.scriptAuthor}>
                    by {script.author || meta?.author || 'Unknown'}
                  </Text>
                  <View style={styles.scriptMeta}>
                    <Text style={styles.scriptType}>{script.script_type}</Text>
                    <Text style={styles.scriptRoles}>
                      {total} roles · {matched}/{total} known
                    </Text>
                  </View>
                  {/* Preview role chips */}
                  <View style={styles.roleChips}>
                    {roleIds.slice(0, 8).map(id => {
                      const role = getRoles()[id];
                      return (
                        <View
                          key={id}
                          style={[
                            styles.roleChip,
                            role
                              ? styles.roleChipKnown
                              : styles.roleChipUnknown,
                          ]}
                        >
                          <Text style={styles.roleChipText}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              {role && (
                                <RoleIcon
                                  roleId={role.id}
                                  team={role.team}
                                  size={12}
                                  showBorder={false}
                                />
                              )}
                              <Text style={styles.roleChipText}>
                                {role ? role.name : id}
                              </Text>
                            </View>
                          </Text>
                        </View>
                      );
                    })}
                    {roleIds.length > 8 && (
                      <Text style={styles.moreRoles}>
                        +{roleIds.length - 8} more
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Pagination */}
          <View style={styles.pagination}>
            <Pressable
              style={[
                styles.pageBtn,
                page <= 1 && styles.pageBtnDisabled,
              ]}
              onPress={() => page > 1 && handleSearch(page - 1)}
              disabled={page <= 1}
            >
              <Text style={styles.pageBtnText}>← Prev</Text>
            </Pressable>
            <Text style={styles.pageNum}>Page {page}</Text>
            <Pressable
              style={[
                styles.pageBtn,
                results.length < 10 && styles.pageBtnDisabled,
              ]}
              onPress={() => results.length >= 10 && handleSearch(page + 1)}
              disabled={results.length < 10}
            >
              <Text style={styles.pageBtnText}>Next →</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && !error && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {query.trim()
              ? 'No scripts found. Try a different search term.'
              : 'Type a script name or author to search botcscripts.com'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a2f1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  currentBadgeText: {
    color: '#fcb93c',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2f313a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: '#fcb93c',
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
  },
  resultCount: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  scriptCard: {
    backgroundColor: '#2f313a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scriptName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  scriptVersion: {
    color: '#888',
    fontSize: 11,
    marginLeft: 8,
  },
  scriptAuthor: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  scriptMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  scriptType: {
    color: '#3492ea',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scriptRoles: {
    color: '#888',
    fontSize: 11,
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  roleChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  roleChipKnown: {
    backgroundColor: 'rgba(52, 146, 234, 0.2)',
  },
  roleChipUnknown: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  roleChipText: {
    color: '#ccc',
    fontSize: 10,
  },
  moreRoles: {
    color: '#666',
    fontSize: 10,
    paddingVertical: 3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  pageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2f313a',
  },
  pageBtnDisabled: {
    opacity: 0.3,
  },
  pageBtnText: {
    color: '#fcb93c',
    fontSize: 13,
    fontWeight: '600',
  },
  pageNum: {
    color: '#888',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
