import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, CAMPUS_LOCATIONS, createIssue, saveDraft, deleteDraft } from '../services/issueService';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CategoryCard from '../components/CategoryCard';
import ImagePickerBox from '../components/ImagePickerBox';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

const successAnim = require('../assets/animations/success-check.json');

export default function ReportIssueScreen({ route, navigation }) {
  const [draftId, setDraftId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electricity');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Block A');
  const [priority, setPriority] = useState('Medium');
  const [images, setImages] = useState([]);
  const [anonymous, setAnonymous] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [createdRef, setCreatedRef] = useState(null);

  useEffect(() => {
    const draft = route.params?.draft;
    const presetLocation = route.params?.presetLocation;
    if (draft) {
      setDraftId(draft.id);
      setTitle(draft.title || '');
      setCategory(draft.category || 'Electricity');
      setDescription(draft.description || '');
      setLocation(draft.location || 'Block A');
      setPriority(draft.priority || 'Medium');
      setImages(draft.images || []);
      setAnonymous(Boolean(draft.anonymous));
    } else if (presetLocation) {
      setLocation(presetLocation);
    }
  }, [route.params]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Please enter a short issue title.';
    if (!description.trim()) e.description = 'Please describe the problem.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setDraftId(null);
    setTitle('');
    setDescription('');
    setImages([]);
    setErrors({});
  };

  const handleSaveDraft = async () => {
    if (!title.trim() && !description.trim()) {
      Alert.alert('Empty Draft', 'Please enter a title or description before saving a draft.');
      return;
    }
    await saveDraft({ id: draftId, title: title.trim() || 'Untitled Draft', category, description: description.trim(), location, priority, images, anonymous });
    resetForm();
    Alert.alert('Draft Saved', 'Your report has been saved offline under My Reports → Drafts.');
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (isOffline) {
      await saveDraft({ id: draftId, title: title.trim(), category, description: description.trim(), location, priority, images, anonymous, waitingForConnection: true });
      resetForm();
      Alert.alert(
        'Waiting for Connection',
        'No internet connection. Report was saved as a draft and will NOT be marked uploaded until you submit online.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const issue = await createIssue({ title: title.trim(), category, description: description.trim(), location, priority, images, anonymous });
      if (draftId) await deleteDraft(draftId);
      setCreatedRef(issue.id);
      resetForm();
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      const isNetworkIssue =
        msg.includes('network') || msg.includes('timed out') || msg.includes('failed to fetch');

      if (isNetworkIssue) {
        await saveDraft({
          id: draftId,
          title: title.trim(),
          category,
          description: description.trim(),
          location,
          priority,
          images,
          anonymous,
          waitingForConnection: true,
        });
        resetForm();
        Alert.alert(
          'Waiting for Connection',
          'Could not reach the server. Your report was safely saved as an offline draft under My Reports → Drafts.'
        );
      } else {
        Alert.alert('Submission Failed', err.message || 'Could not submit report.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={draftId ? 'Edit Draft Report' : 'Report an Issue'} subtitle="Help campus maintenance respond faster" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Connection Status Bar */}
        <TouchableOpacity
          style={[styles.connBar, isOffline ? styles.connOffline : styles.connOnline]}
          onPress={() => setIsOffline((o) => !o)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isOffline ? 'cloud-offline-outline' : 'cloud-done-outline'}
            size={16}
            color={isOffline ? COLORS.pending : COLORS.resolved}
          />
          <Text style={[styles.connText, { color: isOffline ? COLORS.pending : COLORS.resolved }]}>
            {isOffline ? 'Offline Mode · Waiting for Connection (Tap to go Online)' : 'Online · Ready to Submit (Tap to test Offline)'}
          </Text>
        </TouchableOpacity>

        <CustomInput
          label="Issue Title *"
          placeholder="e.g. Broken fan in Room 302"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />

        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {CATEGORIES.map((c) => (
            <CategoryCard
              key={c.label}
              label={c.label}
              icon={c.icon}
              selected={category === c.label}
              onPress={() => setCategory(c.label)}
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>Campus Location *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {CAMPUS_LOCATIONS.map((loc) => (
            <TouchableOpacity
              key={loc}
              style={[styles.locChip, location === loc && styles.locChipActive]}
              onPress={() => setLocation(loc)}
            >
              <Text style={[styles.locText, location === loc && styles.locTextActive]}>{loc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {['Low', 'Medium', 'High'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.priorityBtn, priority === p && styles.priorityActive]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomInput
          label="Description *"
          placeholder="Describe what happened and exact room/spot..."
          value={description}
          onChangeText={setDescription}
          multiline
          error={errors.description}
        />

        <ImagePickerBox images={images} onChange={setImages} />

        <View style={styles.switchRow}>
          <View>
            <Text style={TYPOGRAPHY.label}>Report Anonymously</Text>
            <Text style={TYPOGRAPHY.caption}>Hide your name from public issue feeds</Text>
          </View>
          <Switch
            value={anonymous}
            onValueChange={setAnonymous}
            trackColor={{ false: COLORS.warmSand, true: COLORS.mutedSage }}
            thumbColor={anonymous ? COLORS.forestGreen : COLORS.softWhite}
          />
        </View>

        <View style={styles.btnRow}>
          <CustomButton title="Save Draft" variant="secondary" onPress={handleSaveDraft} style={{ flex: 1 }} />
          <CustomButton title={isOffline ? 'Queue Offline' : 'Submit Report'} onPress={handleSubmit} loading={submitting} style={{ flex: 1.4 }} />
        </View>
      </ScrollView>

      <Modal visible={Boolean(createdRef)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <LottieView source={successAnim} autoPlay loop={false} style={styles.lottie} />
            <Text style={styles.modalTitle}>Report Submitted</Text>
            <Text style={styles.modalBody}>
              Your reference ID is <Text style={styles.refId}>{createdRef}</Text>. You can track updates under My Reports.
            </Text>
            <CustomButton
              title="View My Reports"
              onPress={() => {
                setCreatedRef(null);
                navigation.navigate('My Reports');
              }}
              style={styles.modalBtn}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ivory },
  container: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl },
  connBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: RADIUS.md, marginBottom: SPACING.md, borderWidth: 1 },
  connOnline: { backgroundColor: COLORS.resolvedBg, borderColor: '#BBF7D0' },
  connOffline: { backgroundColor: COLORS.pendingBg, borderColor: '#FDE68A' },
  connText: { fontSize: 12, fontWeight: '600', flex: 1 },
  label: { ...TYPOGRAPHY.label, marginBottom: 8 },
  chipScroll: { marginBottom: SPACING.md },
  locChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.softWhite, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  locChipActive: { backgroundColor: COLORS.forestGreen, borderColor: COLORS.forestGreen },
  locText: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary },
  locTextActive: { color: COLORS.softWhite, fontWeight: '600' },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.md },
  priorityBtn: { flex: 1, height: 42, borderRadius: RADIUS.md, backgroundColor: COLORS.softWhite, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  priorityActive: { backgroundColor: COLORS.forestGreen, borderColor: COLORS.forestGreen },
  priorityText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  priorityTextActive: { color: COLORS.softWhite },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.softWhite, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  btnRow: { flexDirection: 'row', gap: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(37, 43, 39, 0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalCard: { width: '100%', backgroundColor: COLORS.softWhite, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  lottie: { width: 100, height: 100 },
  modalTitle: { ...TYPOGRAPHY.h2, marginTop: SPACING.sm },
  modalBody: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginVertical: SPACING.md, fontSize: 14 },
  refId: { fontWeight: '700', color: COLORS.forestGreen },
  modalBtn: { width: '100%' },
});
