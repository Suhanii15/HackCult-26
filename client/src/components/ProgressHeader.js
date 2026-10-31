import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageCircleButton from './LanguageCircleButton';

export default function ProgressHeader({
  currentStep = 1,
  totalSteps = 4,
  stepTitle = '',
  onBack,
  showPersonaliseSegment = true,
}) {
  const { t } = useLanguage();

  const stepNumber = Math.min(currentStep, totalSteps);
  const percent = Math.min(100, Math.max(0, Math.round(((stepNumber - 1) / (totalSteps - 1 || 1)) * 100)));

  return (
    <View style={styles.container}>
      {/* Top action row */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* Step label: "Step 2 of 4 · Electricity" */}
        <View style={styles.labelContainer}>
          <Text style={styles.stepCounterText}>
            {t('step_prefix')} {stepNumber} {t('of')} {totalSteps}
            {stepTitle ? ` · ${stepTitle}` : ''}
          </Text>
        </View>

        {/* Top-right Language Circle Button */}
        <LanguageCircleButton />
      </View>

      {/* Segmented Progress Track */}
      <View style={styles.trackWrapper}>
        <View style={styles.requiredTrack}>
          {/* Green Fill */}
          <View style={[styles.filledTrack, { width: `${percent}%` }]} />

          {/* Leaf indicator riding the leading edge */}
          <View style={[styles.leafIndicator, { left: `${Math.max(0, Math.min(94, percent - 3))}%` }]}>
            <Text style={styles.leafEmoji}>🌱</Text>
          </View>
        </View>

        {/* Optional 5th Personalise segment (dashed) */}
        {showPersonaliseSegment && (
          <View style={styles.personaliseSegment}>
            <Text style={styles.dashedDot}>✦</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  labelContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stepCounterText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  trackWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    height: 18,
  },
  requiredTrack: {
    flex: 4,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  filledTrack: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  leafIndicator: {
    position: 'absolute',
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    top: -7,
  },
  leafEmoji: {
    fontSize: 14,
  },
  personaliseSegment: {
    flex: 1,
    height: 8,
    marginLeft: 6,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedDot: {
    fontSize: 8,
    color: '#9CA3AF',
    lineHeight: 8,
  },
});
