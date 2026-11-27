import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { createTask, getTaskById, updateTask } from '../api/taskApi';
import FadeInView, { ScalePressable } from '../components/FadeInView';
import { colors, spacing, borderRadius, cardShadow } from '../styles/theme';

const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

export default function TaskFormScreen({ route, navigation }) {
  const taskId = route.params?.taskId;
  const duplicateTask = route.params?.duplicateTask;
  const isEditing = Boolean(taskId);

  // Form states
  const [title, setTitle] = useState(duplicateTask ? `${duplicateTask.title} (Copy)` : '');
  const [subject, setSubject] = useState(duplicateTask?.subject || '');
  const [description, setDescription] = useState(duplicateTask?.description || '');
  const [priority, setPriority] = useState(duplicateTask?.priority || 'Medium');
  const [dueDate, setDueDate] = useState(
    duplicateTask?.dueDate ? new Date(duplicateTask.dueDate).toISOString().split('T')[0] : ''
  );

  // UI state
  const [loadingTask, setLoadingTask] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // If editing, fetch existing task details
  useEffect(() => {
    if (isEditing) {
      const fetchExistingTask = async () => {
        try {
          const task = await getTaskById(taskId);
          setTitle(task.title || '');
          setSubject(task.subject || '');
          setDescription(task.description || '');
          setPriority(task.priority || 'Medium');
          if (task.dueDate) {
            setDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
          }
        } catch (err) {
          Alert.alert('Error', err.message || 'Failed to load task details for editing.', [
            { text: 'Go Back', onPress: () => navigation.goBack() },
          ]);
        } finally {
          setLoadingTask(false);
        }
      };

      fetchExistingTask();
    } else {
      // Default due date to tomorrow for new tasks
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [taskId]);

  const handleSave = async () => {
    // 1. Validation
    const trimmedTitle = title.trim();
    const trimmedSubject = subject.trim();
    const trimmedDueDate = dueDate.trim();

    if (!trimmedTitle) {
      Alert.alert('Validation Error', 'Task title is required.');
      return;
    }
    if (!trimmedSubject) {
      Alert.alert('Validation Error', 'Subject is required.');
      return;
    }
    if (!trimmedDueDate) {
      Alert.alert('Validation Error', 'Due date is required.');
      return;
    }

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trimmedDueDate) || isNaN(new Date(trimmedDueDate).getTime())) {
      Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format (e.g. 2026-11-25).');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: trimmedTitle,
        subject: trimmedSubject,
        description: description.trim(),
        priority,
        dueDate: new Date(trimmedDueDate).toISOString(),
      };

      if (isEditing) {
        await updateTask(taskId, payload);
        Alert.alert('Success', 'Assignment updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createTask(payload);
        Alert.alert('Success', 'Assignment created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Operation Failed', err.message || 'Could not save task. Check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTask) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading assignment data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenHeading}>
        {isEditing ? 'Edit Assignment' : 'Create New Assignment'}
      </Text>
      <Text style={styles.screenSubtitle}>
        {isEditing
          ? 'Update the assignment details below.'
          : 'Fill in the information below to track your study task.'}
      </Text>

      {/* Title */}
      <Text style={styles.label}>Task Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Physics Assignment 2"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
        editable={!submitting}
      />

      {/* Subject */}
      <Text style={styles.label}>Subject *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Mathematics, Physics, Chemistry"
        placeholderTextColor={colors.textSecondary}
        value={subject}
        onChangeText={setSubject}
        editable={!submitting}
      />

      {/* Priority */}
      <Text style={styles.label}>Priority Level</Text>
      <View style={styles.priorityRow}>
        {['Low', 'Medium', 'High'].map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.priorityButton,
              priority === p && styles.priorityButtonActive,
              p === 'High' && priority === p && { backgroundColor: colors.danger },
            ]}
            onPress={() => setPriority(p)}
            activeOpacity={0.7}
            disabled={submitting}
          >
            <Text
              style={[
                styles.priorityButtonText,
                priority === p && styles.priorityButtonTextActive,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Due Date */}
      <Text style={styles.label}>Due Date (YYYY-MM-DD) *</Text>
      <View style={styles.presetRow}>
        {[
          { label: 'Today', days: 0 },
          { label: 'Tomorrow', days: 1 },
          { label: 'Next Week', days: 7 },
        ].map((p) => (
          <TouchableOpacity
            key={p.label}
            style={styles.presetChip}
            onPress={() => setDueDate(addDays(p.days))}
            disabled={submitting}
          >
            <Text style={styles.presetText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textSecondary}
        value={dueDate}
        onChangeText={setDueDate}
        editable={!submitting}
      />

      {/* Description */}
      <Text style={styles.label}>Description & Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter topics, questions, or requirements..."
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!submitting}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.saveButton, submitting && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={submitting}
        activeOpacity={0.8}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={submitting}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
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
  screenHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  screenSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  textArea: {
    height: 100,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  presetChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  priorityButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: 'transparent',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  priorityButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
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
});
