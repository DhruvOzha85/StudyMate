import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CAMPUS_LOCATIONS, getIssues } from '../services/issueService';
import Header from '../components/Header';
import IssueCard from '../components/IssueCard';
import EmptyState from '../components/EmptyState';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOW } from '../constants/theme';

export default function LocationExplorerScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState('Block A');

  useFocusEffect(
    useCallback(() => {
      getIssues().then(setIssues);
    }, [])
  );

  const countFor = (loc) => issues.filter((i) => i.location === loc).length;
  const zoneIssues = issues.filter((i) => i.location === selectedLoc);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Campus Locations"
        subtitle="Select a zone to view reported issues"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Simple Interactive Campus Zone Map Grid */}
        <View style={styles.mapCard}>
          <Text style={styles.mapTitle}>Campus Zone Map</Text>
          <View style={styles.grid}>
            {CAMPUS_LOCATIONS.map((loc) => {
              const count = countFor(loc);
              const active = selectedLoc === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.zoneBox, active && styles.zoneBoxActive]}
                  onPress={() => setSelectedLoc(loc)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="location"
                    size={16}
                    color={active ? COLORS.softWhite : COLORS.forestGreen}
                  />
                  <Text style={[styles.zoneName, active && styles.zoneNameActive]} numberOfLines={1}>
                    {loc}
                  </Text>
                  <View style={[styles.badge, active && styles.badgeActive]}>
                    <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={TYPOGRAPHY.h3}>{selectedLoc} ({zoneIssues.length})</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Report', params: { presetLocation: selectedLoc } })}>
            <Text style={styles.reportLink}>+ Report Here</Text>
          </TouchableOpacity>
        </View>

        {zoneIssues.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title={`No issues in ${selectedLoc}`}
            subtitle="Everything looks good in this campus zone."
          />
        ) : (
          zoneIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onPress={() => navigation.navigate('IssueDetails', { issueId: issue.id })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ivory },
  container: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl },
  mapCard: { backgroundColor: COLORS.softWhite, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg, ...SHADOW },
  mapTitle: { ...TYPOGRAPHY.label, color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  zoneBox: { width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: RADIUS.md, backgroundColor: COLORS.ivory, borderWidth: 1, borderColor: COLORS.border },
  zoneBoxActive: { backgroundColor: COLORS.forestGreen, borderColor: COLORS.forestGreen },
  zoneName: { flex: 1, fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  zoneNameActive: { color: COLORS.softWhite },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full, backgroundColor: COLORS.warmSand },
  badgeActive: { backgroundColor: COLORS.terracotta },
  badgeText: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary },
  badgeTextActive: { color: COLORS.softWhite },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  reportLink: { fontSize: 13, fontWeight: '600', color: COLORS.forestGreen },
});
