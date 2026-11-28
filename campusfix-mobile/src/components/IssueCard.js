import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCard from './AnimatedCard';
import StatusBadge from './StatusBadge';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';

export default function IssueCard({ issue, onPress, index = 0 }) {
  return (
    <AnimatedCard delay={Math.min(index * 50, 250)} onPress={onPress} style={styles.card}>
      {issue.image ? (
        <Image source={typeof issue.image === 'number' ? issue.image : { uri: issue.image }} style={styles.thumb} />
      ) : null}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.category}>{issue.category}</Text>
          <StatusBadge status={issue.status} />
        </View>
        <Text style={styles.title} numberOfLines={2}>{issue.title}</Text>
        <View style={styles.footer}>
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{issue.location}</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="people-outline" size={13} color={COLORS.forestGreen} />
            <Text style={[styles.metaText, { color: COLORS.forestGreen, fontWeight: '600' }]}>
              {issue.supporters || 0} {(issue.supporters || 0) >= 10 ? '· Popular' : ''}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.softWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 4,
    marginBottom: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    ...SHADOW,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.softBeige,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.terracotta,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '72%',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
