import React, { useState, useCallback } from 'react';
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

export default function DashboardScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tasks from backend
  const loadTasks = async () => {
    try {
      setError(null);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError('Could not connect to server. Ensure backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload tasks whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  // Compute live statistics from tasks array
  const total = tasks.length;
  const pending = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;
  const highPriority = tasks.filter((t) => t.priority === 'High' && !t.completed).length;

  // Take top 4 recent/pending tasks
  const recentTasks = tasks.slice(0, 4);

  // Format date helper (YYYY-MM-DD)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeSubtitle}>StudyMate</Text>
        <Text style={styles.welcomeTitle}>Student Dashboard</Text>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.primaryButton, { flex: 1, marginRight: spacing.sm }]}
          onPress={() => navigation.navigate('TaskForm')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>+ Add Task</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, { flex: 1, marginLeft: spacing.sm }]}
          onPress={() => navigation.navigate('MyTasks')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>View All Tasks</Text>
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTasks}>
            <Text style={styles.retryText}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tasks from server...</Text>
        </View>
      ) : (
        <>
          {/* Statistics Grid */}
          <Text style={styles.sectionTitle}>Task Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{total}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>{pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.danger }]}>{highPriority}</Text>
              <Text style={styles.statLabel}>High Priority</Text>
            </View>
          </View>

          {/* Recent Tasks */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Tasks</Text>
            {tasks.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('MyTasks')}>
                <Text style={styles.seeAllText}>See all ({total})</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No assignments yet</Text>
              <Text style={styles.emptySubtitle}>Tap "+ Add Task" above to create your first study task.</Text>
            </View>
          ) : (
            recentTasks.map((task) => (
              <TouchableOpacity
                key={task._id}
                style={styles.taskCard}
                onPress={() => navigation.navigate('TaskDetails', { taskId: task._id })}
                activeOpacity={0.7}
              >
                <View style={styles.taskCardHeader}>
                  <Text style={styles.taskSubject}>{task.subject}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      task.priority === 'High' && styles.priorityHigh,
                      task.priority === 'Medium' && styles.priorityMedium,
                      task.priority === 'Low' && styles.priorityLow,
                    ]}
                  >
                    <Text style={styles.priorityText}>{task.priority}</Text>
                  </View>
                </View>

                <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                  {task.title}
                </Text>

                <View style={styles.taskFooter}>
                  <Text style={styles.taskDueDate}>Due: {formatDate(task.dueDate)}</Text>
                  <Text
                    style={[
                      styles.statusPill,
                      task.completed ? { color: colors.success } : { color: colors.warning },
                    ]}
                  >
                    {task.completed ? '✓ Completed' : '• Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  taskCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  taskSubject: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityMedium: {
    backgroundColor: '#FEF3C7',
  },
  priorityLow: {
    backgroundColor: '#E0F2FE',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  taskDueDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusPill: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  retryText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
