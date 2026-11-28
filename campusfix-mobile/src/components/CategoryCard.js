import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

export default function CategoryCard({ label, icon = 'construct-outline', selected = false, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={16}
        color={selected ? COLORS.softWhite : COLORS.forestGreen}
      />
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  selected: {
    backgroundColor: COLORS.forestGreen,
    borderColor: COLORS.forestGreen,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  textSelected: {
    color: COLORS.softWhite,
    fontWeight: '600',
  },
});
