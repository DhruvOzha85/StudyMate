import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  loading = false,
  disabled = false,
  style,
}) {
  const isOutline = variant === 'outline';
  const bgColor =
    variant === 'secondary'
      ? COLORS.warmSand
      : variant === 'danger'
      ? COLORS.rejected
      : isOutline
      ? 'transparent'
      : COLORS.forestGreen;

  const textColor =
    variant === 'secondary'
      ? COLORS.textPrimary
      : isOutline
      ? COLORS.forestGreen
      : COLORS.softWhite;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor },
        isOutline && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.forestGreen,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});
