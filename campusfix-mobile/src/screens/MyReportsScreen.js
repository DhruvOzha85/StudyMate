import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getIssues, getDrafts, deleteDraft } from '../services/issueService';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

const TABS = ['All', 'Pending', 'In Progress', 'Resolved', 'Drafts'];

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [tab, setTab] = useState('All');

  const loadData = async () => {
    const [list, savedDrafts] = await Promise.all([getIssues(), getDrafts()]);
    setReports(list.filter((i) => i.isMine));
    setDrafts(savedDrafts);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleDeleteDraft = (id) => {
    Alert.alert('Delete Draft', 'Remove this offline draft?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => setDrafts(await deleteDraft(id)),
      },
    ]);
  };

  const filtered =
    tab === 'Drafts'
      ? drafts
      : reports.filter((r) => {
          if (tab === 'Pending') return r.status === 'Submitted';
          if (tab === 'In Progress') return ['Acknowledged', 'Assigned', 'In Progress'].includes(r.status);
          if (tab === 'Resolved') return r.status === 'Resolved';
          return true;
        });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="My Reports" subtitle="Track submitted issues and offline drafts" />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t}{t === 'Drafts' && drafts.length ? ` (${drafts.length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={tab === 'Drafts' ? 'No offline drafts' : 'No reports in this tab'}
            subtitle={tab === 'Drafts' ? 'Drafts saved offline appear here until submitted.' : 'Submit a campus issue to track its resolution here.'}
            actionLabel="Report an Issue"
            onAction={() => navigation.navigate('Report')}
          />
        }
        renderItem={({ item }) =>
          tab === 'Drafts' ? (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.draftBadge}>Waiting for Connection</Text>
                <Text style={styles.meta}>{item.updatedAt}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.category} · {item.location}</Text>
              <View style={styles.draftActions}>
                <TouchableOpacity
                  style={styles.editDraftBtn}
                  onPress={() => navigation.navigate('Report', { draft: item })}
                >
                  <Text style={styles.editDraftText}>Edit & Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteDraft(item.id)}>
                  <Text style={styles.delDraftText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('IssueDetails', { issueId: item.id })}
              activeOpacity={0.82}
            >
              <View style={styles.topRow}>
                <Text style={styles.refId}>{item.id}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.bottomRow}>
                <Text style={styles.meta}>{item.category}</Text>
                <Text style={styles.meta}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ivory },
  tabRow: { paddingHorizontal: SPACING.md, gap: 8, marginBottom: SPACING.sm },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.softBeige, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.forestGreen },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.softWhite },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
  card: { backgroundColor: COLORS.softWhite, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm, ...SHADOW },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  refId: { fontSize: 12, fontWeight: '700', color: COLORS.forestGreen },
  draftBadge: { fontSize: 11, fontWeight: '700', color: COLORS.pending, backgroundColor: COLORS.pendingBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 12, color: COLORS.textSecondary },
  draftActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  editDraftBtn: { backgroundColor: COLORS.forestGreen, paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.sm },
  editDraftText: { color: COLORS.softWhite, fontSize: 12, fontWeight: '600' },
  delDraftText: { color: COLORS.rejected, fontSize: 13, fontWeight: '600' },
});
