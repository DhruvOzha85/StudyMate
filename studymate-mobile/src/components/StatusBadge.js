import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

const STATUS_MAP = {
  Submitted: { color: COLORS.pending, bg: COLORS.pendingBg },
  Pending: { color: COLORS.pending, bg: COLORS.pendingBg },
  Acknowledged: { color: COLORS.inProgress, bg: COLORS.inProgressBg },
  Assigned: { color: COLORS.inProgress, bg: COLORS.inProgressBg },
  'In Progress': { color: COLORS.inProgress, bg: COLORS.inProgressBg },
  Resolved: { color: COLORS.resolved, bg: COLORS.resolvedBg },
  Rejected: { color: COLORS.rejected, bg: COLORS.rejectedBg },
};

export default function StatusBadge({ status = 'Submitted' }) {
  const theme = STATUS_MAP[status] || STATUS_MAP.Submitted;
  return (
    <View style={[styles.badge, { backgroundColor: theme.bg }]}>
      <Text style={[styles.text, { color: theme.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
