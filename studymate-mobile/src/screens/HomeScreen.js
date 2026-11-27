import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getIssues, getNotifications, getUser } from '../services/issueService';
import StatCard from '../components/StatCard';
import IssueCard from '../components/IssueCard';
import CustomButton from '../components/CustomButton';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOW } from '../constants/theme';

const heroPhoto = require('../assets/images/campus-hero.jpg');

export default function HomeScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [user, setUser] = useState({ name: 'Student' });
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = async () => {
    const [list, u, notifs] = await Promise.all([getIssues(), getUser(), getNotifications()]);
    setIssues(list);
    setUser(u);
    setUnreadCount(notifs.filter((n) => !n.read).length);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const total = issues.length;
  const inProgress = issues.filter((i) => ['Acknowledged', 'Assigned', 'In Progress'].includes(i.status)).length;
  const resolved = issues.filter((i) => i.status === 'Resolved').length;
  const recent = issues.slice(0, 3);

  const quickActions = [
    { label: 'Report Issue', icon: 'add-circle-outline', onPress: () => navigation.navigate('Report') },
    { label: 'My Reports', icon: 'document-text-outline', onPress: () => navigation.navigate('My Reports') },
    { label: 'Campus Map', icon: 'map-outline', onPress: () => navigation.navigate('LocationExplorer') },
    { label: 'Updates', icon: 'notifications-outline', onPress: () => navigation.navigate('Notifications') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || 'S')[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Good Morning!</Text>
              <Text style={styles.userName}>{user?.name || 'Student'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.forestGreen} />
            {unreadCount > 0 && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <ImageBackground source={heroPhoto} style={styles.hero} imageStyle={styles.heroImg}>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Let's Make Our Campus Better</Text>
            <Text style={styles.heroBody}>Notice something that needs fixing? Let us know.</Text>
            <CustomButton
              title="Report an Issue"
              onPress={() => navigation.navigate('Report')}
              style={styles.heroBtn}
            />
          </View>
        </ImageBackground>

        {/* Quick Statistics */}
        <View style={styles.statsRow}>
          <StatCard label="Total Reports" value={total} accentColor={COLORS.forestGreen} />
          <StatCard label="In Progress" value={inProgress} accentColor={COLORS.inProgress} />
          <StatCard label="Resolved" value={resolved} accentColor={COLORS.resolved} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {quickActions.map((act) => (
            <TouchableOpacity key={act.label} style={styles.actionCard} onPress={act.onPress} activeOpacity={0.8}>
              <View style={styles.actionIcon}>
                <Ionicons name={act.icon} size={20} color={COLORS.forestGreen} />
              </View>
              <Text style={styles.actionLabel}>{act.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {recent.map((issue, index) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            index={index}
            onPress={() => navigation.navigate('IssueDetails', { issueId: issue.id })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ivory },
  container: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.forestGreen, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.ivory, fontSize: 17, fontWeight: '700' },
  greeting: { ...TYPOGRAPHY.caption },
  userName: { ...TYPOGRAPHY.h3 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.softWhite, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  unreadDot: { position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.terracotta },
  hero: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOW },
  heroImg: { borderRadius: RADIUS.lg },
  heroOverlay: { padding: SPACING.lg, backgroundColor: 'rgba(29, 64, 54, 0.72)' },
  heroTitle: { fontSize: 21, fontWeight: '700', color: COLORS.ivory, marginBottom: 6 },
  heroBody: { fontSize: 14, color: COLORS.softBeige, marginBottom: SPACING.md, lineHeight: 20 },
  heroBtn: { alignSelf: 'flex-start', paddingHorizontal: 20, height: 42, backgroundColor: COLORS.terracotta },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.h3, marginBottom: SPACING.sm },
  seeAll: { fontSize: 13, fontWeight: '600', color: COLORS.forestGreen, marginBottom: SPACING.sm },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: SPACING.lg },
  actionCard: { flex: 1, backgroundColor: COLORS.softWhite, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  actionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.softBeige, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textPrimary },
});
