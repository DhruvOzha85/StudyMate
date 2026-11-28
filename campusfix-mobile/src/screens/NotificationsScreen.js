import React, { useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/issueService';
import Header from '../components/Header';
import NotificationCard from '../components/NotificationCard';
import EmptyState from '../components/EmptyState';
import { COLORS, SPACING } from '../constants/theme';

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getNotifications().then(setItems);
    }, [])
  );

  const handleMarkRead = async (id) => {
    setItems(await markNotificationRead(id));
  };

  const handleMarkAll = async () => {
    setItems(await markAllNotificationsRead());
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Notifications"
        subtitle="Status updates & community alerts"
        onBack={() => navigation.goBack()}
        rightIcon="checkmark-done-outline"
        onRightPress={handleMarkAll}
      />

      {items.some((i) => !i.read) && (
        <TouchableOpacity onPress={handleMarkAll} style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="No notifications" subtitle="You're all caught up on campus updates." />}
        renderItem={({ item }) => (
          <NotificationCard item={item} onPress={() => handleMarkRead(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ivory },
  markAllBtn: { alignSelf: 'flex-end', paddingHorizontal: SPACING.md, paddingBottom: 6 },
  markAllText: { fontSize: 13, fontWeight: '600', color: COLORS.forestGreen },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
});
