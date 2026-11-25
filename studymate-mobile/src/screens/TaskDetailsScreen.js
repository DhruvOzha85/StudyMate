import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTaskById, updateTask, deleteTask } from '../api/taskApi';
import { colors, spacing, borderRadius } from '../styles/theme';

export default function TaskDetailsScreen({ route, navigation }) {
  const { taskId } = route.params || {};

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load task details by ID
  const loadTask = async () => {
    if (!taskId) {
      setError('Task ID was not provided.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getTaskById(taskId);
      setTask(data);
    } catch (err) {
      setError(err.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  // Reload when screen gains focus (e.g. returning from Edit mode)
  useFocusEffect(
    useCallback(() => {
      loadTask();
    }, [taskId])
  );

  // Toggle completion status
  const handleToggleStatus = async () => {
    if (!task) return;
    setActionLoading(true);
    try {
      const updated = await updateTask(task._id, { completed: !task.completed });
      setTask(updated);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete task with confirmation alert
  const handleDelete = () => {
    if (!task) return;
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteTask(task._id);
              Alert.alert('Deleted', 'Task has been deleted successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete task.');
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const handleRetry = () => {
    setLoading(true);
    loadTask();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Task Unavailable</Text>
        <Text style={styles.errorSubtitle}>{error || 'The requested task could not be found.'}</Text>
        <View style={styles.errorActionsRow}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.subjectText}>{task.subject}</Text>
          <View
            style={[
              styles.priorityBadge,
              task.priority === 'High' && styles.priorityHigh,
              task.priority === 'Medium' && styles.priorityMedium,
              task.priority === 'Low' && styles.priorityLow,
            ]}
          >
            <Text style={styles.priorityText}>{task.priority} Priority</Text>
          </View>
        </View>

        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Due Date:</Text>
          <Text style={styles.metaValue}>{formatDate(task.dueDate)}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Status:</Text>
          <View
            style={[
              styles.statusPill,
              task.completed ? styles.statusPillCompleted : styles.statusPillPending,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                task.completed ? { color: colors.success } : { color: colors.warning },
              ]}
            >
              {task.completed ? '✓ Completed' : '• Pending'}
            </Text>
          </View>
        </View>

        {task.createdAt && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created:</Text>
            <Text style={styles.metaValueSmall}>{formatDate(task.createdAt)}</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Description & Notes</Text>
        <Text style={styles.descriptionText}>
          {task.description ? task.description : 'No additional description provided.'}
        </Text>
      </View>

      {/* Status Toggle Action */}
      <TouchableOpacity
        style={[
          styles.statusToggleButton,
          task.completed ? styles.buttonUndo : styles.buttonComplete,
          actionLoading && styles.buttonDisabled,
        ]}
        onPress={handleToggleStatus}
        disabled={actionLoading}
        activeOpacity={0.8}
      >
        {actionLoading ? (
          <ActivityIndicator color={task.completed ? colors.text : '#FFFFFF'} />
        ) : (
          <Text
            style={[
              styles.statusToggleText,
              task.completed && { color: colors.text },
            ]}
          >
            {task.completed ? 'Mark as Pending' : '✓ Mark as Completed'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Edit and Delete Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('TaskForm', { taskId: task._id })}
          disabled={actionLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>Edit Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          disabled={actionLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>Delete Task</Text>
        </TouchableOpacity>
      </View>
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
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  subjectText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
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
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginVertical: spacing.sm,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 90,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  metaValueSmall: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPillCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  statusToggleButton: {
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonComplete: {
    backgroundColor: colors.success,
  },
  buttonUndo: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusToggleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: colors.danger,
    marginLeft: spacing.sm,
  },
  deleteButtonText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  backButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
});
