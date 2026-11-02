export const COLORS = {
  // Brand colors
  primary: '#00897B',        // Vibrant teal-green (JouleBug / Mission LiFE standard)
  primaryDark: '#00695C',    // Deep forest teal
  primaryLight: '#E0F2F1',   // Soft mint tint
  accent: '#10B981',         // Emerald green highlight (Active tab color)

  // Surface & Neutrals
  white: '#FFFFFF',
  card: '#FFFFFF',
  background: '#F8FAFC',
  inputBg: '#F9FAFB',
  border: '#E5E7EB',
  borderDark: '#374151',

  // Dark Surface for Navigation Tab Bar
  darkSurface: '#111827',
  darkSurfaceElevated: '#1F2937',

  // Typography Colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#E0F2F1',
  textOnDark: '#F9FAFB',
  textOnDarkMuted: '#9CA3AF',
  textOnPrimaryMuted: 'rgba(255, 255, 255, 0.85)',

  // Status & Alerts
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  success: '#10B981',
  successBg: '#ECFDF5',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  // Ease Chips Colors (Easy = green, Medium = amber, Difficult = red)
  ease: {
    easy: '#10B981',
    easyBg: '#ECFDF5',
    easyText: '#065F46',
    medium: '#F59E0B',
    mediumBg: '#FFFBEB',
    mediumText: '#92400E',
    difficult: '#EF4444',
    difficultBg: '#FEF2F2',
    difficultText: '#991B1B',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADII = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  h1: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyBold: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  subtext: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '600', lineHeight: 14, letterSpacing: 0.4 },
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
