import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUser, updateUser, logoutUser, getIssues } from '../services/issueService';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({ name: 'Student', email: 'student@university.edu', role: 'Student' });
  const [stats, setStats] = useState({ total: 0, resolved: 0 });
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getUser(), getIssues()]).then(([u, list]) => {
        setUser(u);
        setNameInput(u.name || '');
        const mine = list.filter((i) => i.isMine);
        setStats({ total: mine.length, resolved: mine.filter((i) => i.status === 'Resolved').length });
      });
    }, [])
  );

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    const updated = await updateUser({ name: nameInput.trim() });
    setUser(updated);
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Sign out of CampusFix on this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Profile & Settings" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user.name || 'S')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>
        </View>

        {editing ? (
          <View style={styles.card}>
            <CustomInput label="Full Name" value={nameInput} onChangeText={setNameInput} />
            <CustomButton title="Save Name" onPress={handleSaveName} />
          </View>
        ) : (
          <View style={styles.card}>
            <TouchableOpacity style={styles.rowItem} onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={20} color={COLORS.forestGreen} />
              <Text style={styles.rowText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowItem}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.forestGreen} />
              <Text style={styles.rowText}>Notification Preferences</Text>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: COLORS.warmSand, true: COLORS.mutedSage }}
                thumbColor={notifEnabled ? COLORS.forestGreen : COLORS.softWhite}
              />
            </View>

            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => Alert.alert('Help & Support', 'Contact campus-helpdesk@university.edu for urgent facility emergencies.')}
            >
              <Ionicons name="help-circle-outline" size={20} color={COLORS.forestGreen} />
              <Text style={styles.rowText}>Help and Support</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rowItem, { borderBottomWidth: 0 }]}
              onPress={() => Alert.alert('About CampusFix', 'CampusFix v1.0 — Making Campus Better, Together.')}
            >
              <Ionicons name="information-circle-outline" size={20} color={COLORS.forestGreen} />
              <Text style={styles.rowText}>About CampusFix</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        <CustomButton title="Logout" variant="danger" onPress={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ivory },
  container: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl },
  profileCard: { backgroundColor: COLORS.softWhite, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  avatar: { width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.forestGreen, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 26, fontWeight: '700', color: COLORS.ivory },
  name: { ...TYPOGRAPHY.h2 },
  email: { ...TYPOGRAPHY.caption, marginTop: 2, marginBottom: SPACING.md },
  statsRow: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '700', color: COLORS.forestGreen },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  card: { backgroundColor: COLORS.softWhite, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  rowItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  rowText: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
});
