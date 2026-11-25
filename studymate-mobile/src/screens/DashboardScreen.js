import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTasks } from '../api/taskApi';
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

export default function DashboardScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
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
      setError(err.message || 'Could not connect to server.');
    } finally {
      clearTimeout(slowTimer);
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
      setSlowLoad(false);
    }
  };

  useFocusEffect(useCallback(() => { loadTasks(); }, []));

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter((t) => t.priority === 'High' && !t.completed).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const recentTasks = tasks.slice(0, 4);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadTasks(); }}
          colors={[colors.accent]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.brand}>STUDYMATE</Text>
        <Text style={styles.title}>Student Dashboard</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('TaskForm')}>
          <Text style={styles.primaryBtnText}>+ Add Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('MyTasks')}>
          <Text style={styles.secondaryBtnText}>View All Tasks</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); loadTasks(); }}>
            <Text style={styles.retryText}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>
            {slowLoad ? 'Waking up server... First load can take 20–30s.' : 'Loading tasks...'}
          </Text>
        </View>
      ) : (
        <>
          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.progressTitle}>Overall Progress</Text>
              <Text style={styles.progressPct}>{progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressSub}>{completed} of {total} assignments completed</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Total', value: total, color: colors.primary },
              { label: 'Pending', value: pending, color: colors.warning },
              { label: 'Completed', value: completed, color: colors.success },
              { label: 'High Priority', value: highPriority, color: colors.danger },
            ].map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Recent Tasks</Text>
            {total > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('MyTasks')}>
                <Text style={styles.seeAll}>See all ({total})</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No assignments yet</Text>
              <Text style={styles.emptySub}>Tap "+ Add Task" above to create your first task.</Text>
            </View>
          ) : (
            recentTasks.map((task) => {
              const dueTag = getDueTag(task.dueDate, task.completed);
              return (
                <TouchableOpacity
                  key={task._id}
                  style={[styles.taskCard, { borderLeftColor: priorityColor(task.priority) }]}
                  onPress={() => navigation.navigate('TaskDetails', { taskId: task._id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowBetween}>
                    <Text style={styles.subject}>{task.subject}</Text>
                    <View style={styles.badgeRow}>
                      {dueTag && (
                        <Text style={[styles.dueTag, { color: dueTag.color }]}>{dueTag.label}</Text>
                      )}
                      <Text style={[styles.priorityTag, { color: priorityColor(task.priority) }]}>
                        {task.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.taskTitle, task.completed && styles.strike]}>{task.title}</Text>
                  <View style={styles.rowBetween}>
                    <Text style={styles.dueText}>Due: {formatDate(task.dueDate)}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: task.completed ? colors.success : colors.warning }}>
                      {task.completed ? '✓ Completed' : '• Pending'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.md },
  brand: { fontSize: 12, fontWeight: '800', color: colors.accent, letterSpacing: 1.2 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  primaryBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 13, borderRadius: borderRadius.md, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  secondaryBtn: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingVertical: 13, borderRadius: borderRadius.md, alignItems: 'center' },
  secondaryBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  progressCard: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md },
  progressTitle: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
  progressPct: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: '#334155', borderRadius: borderRadius.full, marginVertical: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: borderRadius.full },
  progressSub: { color: '#94A3B8', fontSize: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.md },
  statCard: { width: '48.5%', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  seeAll: { color: colors.accent, fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  taskCard: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4 },
  subject: { fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.6 },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  dueTag: { fontSize: 11, fontWeight: '800' },
  priorityTag: { fontSize: 11, fontWeight: '700' },
  taskTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginVertical: 4 },
  strike: { textDecorationLine: 'line-through', color: colors.textSecondary },
  dueText: { fontSize: 12, color: colors.textSecondary },
  emptyCard: { backgroundColor: colors.card, padding: spacing.xl, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  centerBox: { padding: spacing.xl, alignItems: 'center' },
  loadingText: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  errorBox: { backgroundColor: '#FEE2E2', padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.xs },
  retryText: { color: colors.danger, fontWeight: '700', fontSize: 13, textDecorationLine: 'underline' },
});
