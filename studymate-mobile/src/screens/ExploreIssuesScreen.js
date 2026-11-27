import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, getIssues } from '../services/issueService';
import Header from '../components/Header';
import CategoryCard from '../components/CategoryCard';
import IssueCard from '../components/IssueCard';
import EmptyState from '../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const STATUS_FILTERS = ['All', 'Submitted', 'In Progress', 'Resolved'];

export default function ExploreIssuesScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortPopular, setSortPopular] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getIssues().then(setIssues);
    }, [])
  );

  const q = search.trim().toLowerCase();
  const filtered = issues
    .filter((i) => selectedCategory === 'All' || i.category === selectedCategory)
    .filter((i) => selectedStatus === 'All' || i.status === selectedStatus)
    .filter((i) => !q || i.title.toLowerCase().includes(q) || i.location.toLowerCase().includes(q))
    .sort((a, b) => (sortPopular ? (b.supporters || 0) - (a.supporters || 0) : b.date.localeCompare(a.date)));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Explore Issues"
        subtitle="Browse reports across campus"
        rightIcon={sortPopular ? 'flame' : 'time-outline'}
        onRightPress={() => setSortPopular((s) => !s)}
      />

      <View style={styles.controls}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search issue or location..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          <CategoryCard label="All" icon="apps-outline" selected={selectedCategory === 'All'} onPress={() => setSelectedCategory('All')} />
          {CATEGORIES.map((c) => (
            <CategoryCard
              key={c.label}
              label={c.label}
              icon={c.icon}
              selected={selectedCategory === c.label}
              onPress={() => setSelectedCategory(c.label)}
            />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {STATUS_FILTERS.map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.statusChip, selectedStatus === st && styles.statusChipActive]}
              onPress={() => setSelectedStatus(st)}
            >
              <Text style={[styles.statusText, selectedStatus === st && styles.statusTextActive]}>{st}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="No matching issues" subtitle="Try clearing your filters or search query." />}
        renderItem={({ item, index }) => (
          <IssueCard
            issue={item}
            index={index}
            onPress={() => navigation.navigate('IssueDetails', { issueId: item.id })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ivory },
  controls: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.softWhite, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, height: 44, marginBottom: SPACING.sm },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  row: { marginBottom: SPACING.sm },
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.softBeige, marginRight: 8 },
  statusChipActive: { backgroundColor: COLORS.terracotta },
  statusText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  statusTextActive: { color: COLORS.softWhite },
  list: { padding: SPACING.md, paddingTop: 4, paddingBottom: SPACING.xl },
});
