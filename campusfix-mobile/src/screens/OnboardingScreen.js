import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

const SLIDES = [
  {
    title: 'Report Campus Issues',
    body: 'Spot a broken projector, water leak, or Wi-Fi dead zone? Snap a photo and report it in seconds.',
    image: require('../assets/images/campus-hero.jpg'),
  },
  {
    title: 'Track Every Update',
    body: 'Follow your report through every stage—from Submitted and Assigned to In Progress and Resolved.',
    image: require('../assets/images/campus-library.jpg'),
  },
  {
    title: 'Build a Better Campus',
    body: 'Support issues raised by fellow students so maintenance teams can prioritize what matters most.',
    image: require('../assets/images/campus-walkway.jpg'),
  },
];

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('campusfix_onboarded', 'true');
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={finishOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Image source={slide.image} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <CustomButton
          title={isLast ? 'Get Started' : 'Next'}
          onPress={() => (isLast ? finishOnboarding() : setIndex(index + 1))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
    padding: SPACING.md,
    paddingTop: 52,
    justifyContent: 'space-between',
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  image: {
    width: '100%',
    height: '48%',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.softBeige,
  },
  content: {
    paddingBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: SPACING.sm,
  },
  body: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warmSand,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.forestGreen,
  },
});
