import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import CustomButton from './CustomButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const emptyAnim = require('../assets/animations/empty-box.json');

export default function EmptyState({
  title = 'Nothing here yet',
  subtitle = 'Check back later or create a new report.',
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <LottieView source={emptyAnim} autoPlay loop style={styles.lottie} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction && (
        <CustomButton title={actionLabel} onPress={onAction} style={styles.btn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 96,
    height: 96,
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h3,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  btn: {
    marginTop: SPACING.md,
    minWidth: 160,
  },
});
