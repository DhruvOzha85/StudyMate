import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !fullName.trim()) e.fullName = 'Full name is required.';
    if (!email.trim() || !email.includes('@')) e.email = 'Enter a valid university email.';
    if (mode !== 'forgot' && password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (mode === 'signup' && password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (mode === 'forgot') {
      Alert.alert(
        'Password Reset',
        `Local demo mode: no backend email server is connected. You can sign in directly with ${email.trim()}.`
      );
      setMode('login');
      return;
    }

    setLoading(true);
    try {
      const user = {
        name: mode === 'signup' ? fullName.trim() : email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: 'Student',
      };
      await AsyncStorage.setItem('campusfix_user', JSON.stringify(user));
      navigation.replace('MainTabs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.brand}>CAMPUSFIX</Text>
        <Text style={styles.title}>
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'login'
            ? 'Sign in with your university email (stored locally on this device).'
            : mode === 'signup'
            ? 'Join students making campus maintenance faster.'
            : 'Enter your university email to reset your local session.'}
        </Text>
      </View>

      <View style={styles.card}>
        {mode === 'signup' && (
          <CustomInput
            label="Full Name"
            placeholder="e.g. Aarav Sharma"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
          />
        )}

        <CustomInput
          label="University Email"
          placeholder="student@university.edu"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />

        {mode !== 'forgot' && (
          <CustomInput
            label="Password"
            placeholder="Minimum 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
        )}

        {mode === 'signup' && (
          <CustomInput
            label="Confirm Password"
            placeholder="Re-enter password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
          />
        )}

        {mode === 'login' && (
          <TouchableOpacity onPress={() => { setErrors({}); setMode('forgot'); }} style={styles.forgotBtn}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <CustomButton
          title={mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Continue'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setErrors({});
            setMode(mode === 'login' ? 'signup' : 'login');
          }}
        >
          <Text style={styles.linkText}>
            {mode === 'login' ? 'Create Account' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  content: { padding: SPACING.md, paddingTop: 64, paddingBottom: SPACING.xl },
  header: { marginBottom: SPACING.lg },
  brand: { fontSize: 12, fontWeight: '700', color: COLORS.forestGreen, letterSpacing: 1.4, marginBottom: 6 },
  title: { ...TYPOGRAPHY.h1, marginBottom: 6 },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, fontSize: 14 },
  card: {
    backgroundColor: COLORS.softWhite,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.md },
  submitBtn: { marginTop: SPACING.xs },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  switchLabel: { color: COLORS.textSecondary, fontSize: 14 },
  linkText: { color: COLORS.forestGreen, fontWeight: '600', fontSize: 14 },
});
