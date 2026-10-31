import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { t } from '../i18n';

export default function OnboardingFooter({
  canContinue = true,
  onContinue,
  onSkip,
  continueText,
  skipText,
  showSkip = true,
}) {
  return (
    <View style={styles.footerContainer}>
      {/* Primary Continue Button */}
      <TouchableOpacity
        style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
        disabled={!canContinue}
        onPress={onContinue}
        activeOpacity={0.85}
      >
        <Text style={[styles.primaryBtnText, !canContinue && styles.primaryBtnTextDisabled]}>
          {continueText || t('continue')} →
        </Text>
      </TouchableOpacity>

      {/* Secondary Not sure / Skip Button */}
      {showSkip && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={onSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipBtnText}>{skipText || t('skip')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryBtn: {
    minHeight: 52, // 44px+ touch target
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBtnTextDisabled: {
    color: '#9CA3AF',
  },
  skipBtn: {
    minHeight: 44, // 44px+ touch target
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  skipBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
