import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

export default function LoadingIndicator({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.forestGreen} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.ivory,
  },
  text: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
