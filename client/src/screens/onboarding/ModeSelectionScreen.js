import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../theme';
import BrandLogo from '../../components/BrandLogo';
import AppSafeArea from '../../components/AppSafeArea';
import LanguageCircleButton from '../../components/LanguageCircleButton';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ModeSelectionScreen({ onSelectMode, onBack }) {
  const { t } = useLanguage();
  const [selectedMode, setSelectedMode] = useState('household');

  return (
    <AppSafeArea style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header: Back + BrandLogo + Top-right Language Circle Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <BrandLogo size="small" color={COLORS.primary} />
        <LanguageCircleButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.titleBox}>
          <Text style={styles.title}>{t('choose_mode_title')}</Text>
          <Text style={styles.subtitle}>{t('choose_mode_subtitle')}</Text>
        </View>

        {/* Card 1: Household */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setSelectedMode('household')}
          style={[
            styles.modeCard,
            selectedMode === 'household' ? styles.modeCardSelected : styles.modeCardDimmed,
          ]}
        >
          {selectedMode === 'household' && (
            <View style={styles.activeCheck}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          )}
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🏡</Text>
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>{t('mode_household_title')}</Text>
              <Text style={styles.cardBadge}>{t('mode_household_badge')}</Text>
            </View>
          </View>
          {/* <Text style={styles.cardDesc}>{t('mode_household_desc')}</Text> */}
        </TouchableOpacity>

        {/* Card 2: Individual */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setSelectedMode('individual')}
          style={[
            styles.modeCard,
            selectedMode === 'individual' ? styles.modeCardSelected : styles.modeCardDimmed,
          ]}
        >
          {selectedMode === 'individual' && (
            <View style={styles.activeCheck}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          )}
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🎒</Text>
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>{t('mode_individual_title')}</Text>
              <Text style={styles.cardBadge}>{t('mode_individual_badge')}</Text>
            </View>
          </View>
          {/* <Text style={styles.cardDesc}>{t('mode_individual_desc')}</Text> */}
        </TouchableOpacity>

        
      </ScrollView>

      {/* Continue CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.85}
          onPress={() => onSelectMode(selectedMode)}
        >
          <Text style={styles.continueBtnText}>{t('continue')} →</Text>
        </TouchableOpacity>
      </View>
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  titleBox: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: 4,
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  modeCardDimmed: {
    borderColor: '#E5E7EB',
    opacity: 0.72,
  },
  activeCheck: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardBadge: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '700',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  tipBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 2,
    marginBottom: 16,
  },
  tipText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  scanBillDisabledBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  scanBillText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  continueBtn: {
    minHeight: 52,
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
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
