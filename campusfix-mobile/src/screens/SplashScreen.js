import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';

const pulseAnim = require('../assets/animations/splash-pulse.json');

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const seenOnboarding = await AsyncStorage.getItem('campusfix_onboarded');
        const user = await AsyncStorage.getItem('campusfix_user');
        if (!seenOnboarding) {
          navigation.replace('Onboarding');
        } else if (!user) {
          navigation.replace('Auth');
        } else {
          navigation.replace('MainTabs');
        }
      } catch {
        navigation.replace('Onboarding');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <LottieView source={pulseAnim} autoPlay loop style={styles.lottie} />
        <View style={styles.iconBadge}>
          <Ionicons name="business" size={34} color={COLORS.ivory} />
        </View>
      </View>
      <Text style={styles.brand}>CampusFix</Text>
      <Text style={styles.tagline}>Making Campus Better, Together.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  logoWrap: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  lottie: {
    width: 120,
    height: 120,
    position: 'absolute',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.deepGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(246, 244, 239, 0.25)',
  },
  brand: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.ivory,
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.mutedSage,
    marginTop: 6,
    fontWeight: '500',
  },
});
