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
import FadeInView, { ScalePressable } from '../components/FadeInView';
import { colors, spacing, borderRadius, cardShadow } from '../styles/theme';

const formatDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : 'N/A');

const priorityStyle = (p) =>
  p === 'High'
    ? { color: colors.danger, bg: colors.dangerSoft }
    : p === 'Medium'
    ? { color: colors.warning, bg: colors.warningSoft }
    : { color: colors.accent, bg: colors.accentSoft };

export default function TaskDetailsScreen({ route, navigation }) {
  const { taskId } = route.params || {};

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTask = async () => {
    if (!taskId) {
      setError('Task ID was not provided.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setTask(await getTaskById(taskId));
    } catch (err) {
      setError(err.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadTask(); }, [taskId]));

  const handleToggleStatus = async () => {
    if (!task) return;
    setActionLoading(true);
    try {
      setTask(await updateTask(task._id, { completed: !task.completed }));
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    if (!task) return;
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteTask(task._id);
              Alert.alert('Deleted', 'Task deleted successfully.', [
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

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorTitle}>Task Unavailable</Text>
        <Text style={styles.errorSubtitle}>{error || 'The requested task could not be found.'}</Text>
        <View style={styles.errorActionsRow}>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); loadTask(); }}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const pStyle = priorityStyle(task.priority);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FadeInView delay={0}>
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: pStyle.color }]}>
          <View style={styles.badgeRow}>
            <Text style={styles.subjectText}>{task.subject}</Text>
            <View style={[styles.pill, { backgroundColor: pStyle.bg }]}>
              <Text style={[styles.pillText, { color: pStyle.color }]}>{task.priority} Priority</Text>
            </View>
          </View>

          <Text style={[styles.taskTitle, task.completed && styles.strike]}>{task.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{formatDate(task.dueDate)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status</Text>
            <View style={[styles.pill, { backgroundColor: task.completed ? colors.successSoft : colors.warningSoft }]}>
              <Text style={[styles.pillText, { color: task.completed ? colors.success : colors.warning }]}>
                {task.completed ? '✓ Completed' : '• Pending'}
              </Text>
            </View>
          </View>

          {task.createdAt && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Created</Text>
              <Text style={styles.metaValueSmall}>{formatDate(task.createdAt)}</Text>
            </View>
          )}
        </View>
      </FadeInView>

      <FadeInView delay={70}>
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Description & Notes</Text>
          <Text style={styles.descriptionText}>
            {task.description ? task.description : 'No additional description provided.'}
          </Text>
        </View>
      </FadeInView>

      <FadeInView delay={130}>
        <ScalePressable
          style={[
            styles.toggleBtn,
            task.completed ? styles.btnUndo : styles.btnComplete,
            actionLoading && styles.disabled,
          ]}
          onPress={handleToggleStatus}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color={task.completed ? colors.text : '#FFFFFF'} />
          ) : (
            <Text style={[styles.toggleText, task.completed && { color: colors.text }]}>
              {task.completed ? 'Mark as Pending' : '✓ Mark as Completed'}
            </Text>
          )}
        </ScalePressable>

        <View style={styles.actionRow}>
          <ScalePressable
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => navigation.navigate('TaskForm', { taskId: task._id })}
            disabled={actionLoading}
          >
            <Text style={styles.editText}>Edit</Text>
          </ScalePressable>

          <ScalePressable
            style={[styles.actionBtn, styles.dupBtn]}
            onPress={() => navigation.navigate('TaskForm', { duplicateTask: task })}
            disabled={actionLoading}
          >
            <Text style={styles.dupText}>Duplicate</Text>
          </ScalePressable>

          <ScalePressable
            style={[styles.actionBtn, styles.delBtn]}
            onPress={handleDelete}
            disabled={actionLoading}
          >
            <Text style={styles.delText}>Delete</Text>
          </ScalePressable>
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, ...cardShadow },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  subjectText: { fontSize: 12, fontWeight: '800', color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  pillText: { fontSize: 12, fontWeight: '700' },
  taskTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginVertical: spacing.sm },
  strike: { textDecorationLine: 'line-through', color: colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  metaLabel: { fontSize: 13, color: colors.textSecondary, width: 85, fontWeight: '600' },
  metaValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  metaValueSmall: { fontSize: 13, color: colors.textSecondary },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  descriptionText: { fontSize: 14, color: colors.text, lineHeight: 22 },
  toggleBtn: { paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', marginBottom: spacing.md, ...cardShadow },
  btnComplete: { backgroundColor: colors.success },
  btnUndo: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  toggleText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: borderRadius.md, alignItems: 'center', ...cardShadow },
  editBtn: { backgroundColor: colors.primary },
  editText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  dupBtn: { backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accent },
  dupText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  delBtn: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
  delText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
  disabled: { opacity: 0.6 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.background },
  loadingText: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: 14 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  errorSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  errorActionsRow: { flexDirection: 'row', gap: spacing.sm },
  retryBtn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: borderRadius.md },
  retryBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  backBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, paddingHorizontal: 20, borderRadius: borderRadius.md },
  backBtnText: { color: colors.text, fontWeight: '600', fontSize: 14 },
});
