// CampusFix Design System — Warm Ivory & Forest Green

export const COLORS = {
  // Primary Backgrounds
  ivory: '#F6F4EF',
  softWhite: '#FFFFFF',

  // Primary Brand
  forestGreen: '#285C4D',
  deepGreen: '#1D4036',

  // Secondary Accents
  mutedSage: '#A8B8A1',
  terracotta: '#C8754B',
  warmSand: '#E7DDCE',
  softBeige: '#EFEAE0',

  // Text
  textPrimary: '#252B27',
  textSecondary: '#737A73',
  textMuted: '#9A9E98',

  // Status Colors
  pending: '#D97706',
  pendingBg: '#FEF3C7',
  inProgress: '#2563EB',
  inProgressBg: '#EFF6FF',
  resolved: '#16A34A',
  resolvedBg: '#ECFDF5',
  rejected: '#DC2626',
  rejectedBg: '#FEF2F2',

  // Borders
  border: '#E2DDD3',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const TYPOGRAPHY = {
  h1: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.2 },
  h3: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: COLORS.textPrimary, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary },
};

export const SHADOW = {
  shadowColor: '#252B27',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};
