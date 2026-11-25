import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTasks, updateTask } from '../api/taskApi';
import { colors, spacing, borderRadius } from '../styles/theme';

const formatDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

const getDueTag = (dueDate, completed) => {
  if (completed || !dueDate) return null;
  const today = new Date().toISOString().split('T')[0];
  const due = formatDate(dueDate);
  if (due < today) return { label: 'Overdue', color: colors.danger };
  if (due === today) return { label: 'Due Today', color: colors.warning };
  return null;
};

const priorityColor = (p) =>
  p === 'High' ? colors.danger : p === 'Medium' ? colors.warning : colors.accent;

export default function MyTasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortByDue, setSortByDue] = useState(true);
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const loadTasks = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setSlowLoad(false);
    const slowTimer = setTimeout(() => setSlowLoad(true), 4000);

    try {
      setError(null);
      setTasks(await getTasks());
    } catch (err) {
      setError(err.message || 'Unable to load tasks from server.');
    } finally {
      clearTimeout(slowTimer);
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
      setSlowLoad(false);
    }
  };

  useFocusEffect(useCallback(() => { loadTasks(); }, []));

  const handleToggleComplete = async (task) => {
    try {
      const updated = await updateTask(task._id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update task status.');
    }
  };

  const query = search.trim().toLowerCase();
  const visibleTasks = tasks
    .filter((t) => (filter === 'Pending' ? !t.completed : filter === 'Completed' ? t.completed : true))
    .filter((t) => !query || t.title.toLowerCase().includes(query) || t.subject.toLowerCase().includes(query))
    .sort((a, b) =>
      sortByDue
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['All', 'Pending', 'Completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search & Sort Bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search title or subject..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortByDue((s) => !s)}>
          <Text style={styles.sortText}>{sortByDue ? 'Due ↑' : 'Newest'}</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); loadTasks(); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>
            {slowLoad ? 'Waking up server... First load can take 20–30s.' : 'Fetching tasks...'}
          </Text>
        </View>
      ) : visibleTasks.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyTitle}>No tasks found</Text>
          <Text style={styles.emptySub}>
            {query ? `No matches for "${search}".` : `No ${filter.toLowerCase()} tasks right now.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleTasks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadTasks(); }}
              colors={[colors.accent]}
            />
          }
          renderItem={({ item }) => {
            const dueTag = getDueTag(item.dueDate, item.completed);
            return (
              <TouchableOpacity
                style={[styles.taskCard, { borderLeftColor: priorityColor(item.priority) }]}
                onPress={() => navigation.navigate('TaskDetails', { taskId: item._id })}
                activeOpacity={0.7}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.subject}>{item.subject}</Text>
                  <View style={styles.badgeRow}>
                    {dueTag && <Text style={[styles.dueTag, { color: dueTag.color }]}>{dueTag.label}</Text>}
                    <Text style={[styles.priorityTag, { color: priorityColor(item.priority) }]}>{item.priority}</Text>
                  </View>
                </View>

                <Text style={[styles.taskTitle, item.completed && styles.strike]}>{item.title}</Text>

                <View style={styles.rowBetween}>
                  <Text style={styles.dueText}>Due: {formatDate(item.dueDate)}</Text>
                  <TouchableOpacity
                    style={[styles.statusBtn, item.completed ? styles.statusDone : styles.statusPending]}
                    onPress={() => handleToggleComplete(item)}
                  >
                    <Text style={[styles.statusText, { color: item.completed ? colors.success : colors.warning }]}>
                      {item.completed ? '✓ Completed' : '○ Pending'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('TaskForm')} activeOpacity={0.8}>
        <Text style={styles.fabText}>+ Add Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterTab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: borderRadius.sm },
  filterTabActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  filterTextActive: { color: '#FFFFFF' },
  searchRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm },
  searchInput: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: colors.text },
  sortBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: 12, justifyContent: 'center' },
  sortText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  listContent: { padding: spacing.md, paddingBottom: 90 },
  taskCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subject: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  dueTag: { fontSize: 11, fontWeight: '800' },
  priorityTag: { fontSize: 11, fontWeight: '700' },
  taskTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginVertical: 6 },
  strike: { textDecorationLine: 'line-through', color: colors.textSecondary },
  dueText: { fontSize: 12, color: colors.textSecondary },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full, borderWidth: 1 },
  statusPending: { borderColor: colors.warning, backgroundColor: '#FFFBEB' },
  statusDone: { borderColor: colors.success, backgroundColor: '#ECFDF5' },
  statusText: { fontSize: 12, fontWeight: '700' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  loadingText: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  errorBox: { backgroundColor: '#FEE2E2', margin: spacing.md, padding: spacing.md, borderRadius: borderRadius.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  retryText: { color: colors.danger, fontWeight: '700', marginLeft: spacing.sm },
  fab: { position: 'absolute', bottom: spacing.lg, right: spacing.lg, backgroundColor: colors.accent, paddingVertical: 14, paddingHorizontal: 22, borderRadius: borderRadius.full, elevation: 4 },
  fabText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
