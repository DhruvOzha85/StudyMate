import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getIssueById, addComment, toggleSupportIssue, TIMELINE_STEPS } from '../services/issueService';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import LoadingIndicator from '../components/LoadingIndicator';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function IssueDetailsScreen({ route, navigation }) {
  const { issueId } = route.params || {};
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  const loadIssue = async () => {
    const data = await getIssueById(issueId);
    setIssue(data);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadIssue(); }, [issueId]));

  const handlePostComment = async () => {
    if (!commentText.trim() || !issue) return;
    const updated = await addComment(issue.id, commentText);
    setIssue(updated);
    setCommentText('');
  };

  const handleSupport = async () => {
    if (!issue) return;
    const updated = await toggleSupportIssue(issue.id);
    setIssue(updated);
  };

  if (loading || !issue) return <LoadingIndicator message="Loading report details..." />;

  const activeStep = Math.max(0, TIMELINE_STEPS.indexOf(issue.status));
  const gallery = issue.images?.length ? issue.images : issue.image ? [issue.image] : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Issue Details" subtitle={issue.id} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {gallery.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
            {gallery.map((img, i) => (
              <Image key={i} source={typeof img === 'number' ? img : { uri: img }} style={styles.photo} />
            ))}
          </ScrollView>
        )}

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.category}>{issue.category} · {issue.priority} Priority</Text>
            <StatusBadge status={issue.status} />
          </View>
          <Text style={styles.title}>{issue.title}</Text>
          <Text style={styles.body}>{issue.description}</Text>

          <View style={styles.metaGrid}>
            <Text style={styles.meta}>Location: {issue.location}</Text>
            <Text style={styles.meta}>Submitted: {issue.date}</Text>
            <Text style={styles.meta}>Reported by: {issue.reporter}</Text>
          </View>

          <TouchableOpacity
            style={[styles.supportBtn, issue.supportedByMe && styles.supportBtnActive]}
            onPress={handleSupport}
            activeOpacity={0.8}
          >
            <Ionicons
              name={issue.supportedByMe ? 'checkmark-circle' : 'hand-left-outline'}
              size={18}
              color={issue.supportedByMe ? COLORS.softWhite : COLORS.forestGreen}
            />
            <Text style={[styles.supportText, issue.supportedByMe && styles.supportTextActive]}>
              {issue.supportedByMe ? 'Supported · Affects Me Too' : 'Issue Affects Me Too'} ({issue.supporters || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vertical Status Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          {TIMELINE_STEPS.map((step, idx) => {
            const done = idx <= activeStep;
            return (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepCol}>
                  <View style={[styles.stepDot, done && styles.stepDotDone]} />
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <View style={[styles.stepLine, idx < activeStep && styles.stepLineDone]} />
                  )}
                </View>
                <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step}</Text>
              </View>
            );
          })}
          {issue.staffNote ? (
            <View style={styles.staffBox}>
              <Text style={styles.staffTitle}>Staff Update</Text>
              <Text style={styles.staffBody}>{issue.staffNote}</Text>
            </View>
          ) : null}
        </View>

        {/* Comments */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Discussion ({issue.comments?.length || 0})</Text>
          {(issue.comments || []).map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <Text style={styles.commentAuthor}>{c.author} · {c.date}</Text>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          ))}
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add an update or comment..."
              placeholderTextColor={COLORS.textMuted}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handlePostComment}>
              <Ionicons name="send" size={18} color={COLORS.softWhite} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ivory },
  container: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl },
  gallery: { marginBottom: SPACING.md },
  photo: { width: 280, height: 180, borderRadius: RADIUS.md, marginRight: 10, backgroundColor: COLORS.softBeige },
  card: { backgroundColor: COLORS.softWhite, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: 12, fontWeight: '600', color: COLORS.terracotta, textTransform: 'uppercase' },
  title: { ...TYPOGRAPHY.h2, marginVertical: 8 },
  body: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, fontSize: 14 },
  metaGrid: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 4 },
  meta: { fontSize: 13, color: COLORS.textSecondary },
  supportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, paddingVertical: 11, borderRadius: RADIUS.md, backgroundColor: COLORS.softBeige, borderWidth: 1, borderColor: COLORS.forestGreen },
  supportBtnActive: { backgroundColor: COLORS.forestGreen },
  supportText: { fontSize: 13, fontWeight: '600', color: COLORS.forestGreen },
  supportTextActive: { color: COLORS.softWhite },
  sectionTitle: { ...TYPOGRAPHY.h3, marginBottom: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 34 },
  stepCol: { alignItems: 'center', width: 24, marginRight: 10 },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.warmSand, marginTop: 3 },
  stepDotDone: { backgroundColor: COLORS.forestGreen },
  stepLine: { width: 2, flex: 1, backgroundColor: COLORS.warmSand, minHeight: 20 },
  stepLineDone: { backgroundColor: COLORS.forestGreen },
  stepLabel: { fontSize: 14, color: COLORS.textMuted },
  stepLabelDone: { color: COLORS.textPrimary, fontWeight: '600' },
  staffBox: { marginTop: 12, backgroundColor: COLORS.softBeige, padding: 12, borderRadius: RADIUS.sm },
  staffTitle: { fontSize: 12, fontWeight: '700', color: COLORS.forestGreen, marginBottom: 4 },
  staffBody: { fontSize: 13, color: COLORS.textPrimary },
  commentItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  commentAuthor: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  commentText: { fontSize: 14, color: COLORS.textPrimary, marginTop: 2 },
  commentInputRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  commentInput: { flex: 1, height: 42, backgroundColor: COLORS.ivory, borderRadius: RADIUS.md, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.textPrimary },
  sendBtn: { width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: COLORS.forestGreen, justifyContent: 'center', alignItems: 'center' },
});
