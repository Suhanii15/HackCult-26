import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import { COLORS } from '../theme';

const LANGUAGE_OPTIONS = [
  {
    code: 'en',
    title: 'English',
    nativeTitle: 'English',
    badge: 'Standard',
    emoji: '🇬🇧',
  },
  {
    code: 'gu',
    title: 'Gujarati',
    nativeTitle: 'ગુજરાતી',
    badge: 'રાજ્ય ભાષા',
    emoji: '🇮🇳',
  },
  {
    code: 'hi',
    title: 'Hindi',
    nativeTitle: 'हिंदी',
    badge: 'राष्ट्रभाषा',
    emoji: '🇮🇳',
  },
];

export default function LanguageModal() {
  const { language, setLanguage, isModalOpen, closeLanguageModal, t } = useLanguage();

  if (!isModalOpen) return null;

  return (
    <Modal
      visible={isModalOpen}
      transparent
      animationType="fade"
      onRequestClose={closeLanguageModal}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('select_language_title')}</Text>
            <Text style={styles.subtitle}>{t('select_language_subtitle')}</Text>
          </View>

          {/* Options List */}
          <View style={styles.optionsWrap}>
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <TouchableOpacity
                  key={opt.code}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  activeOpacity={0.85}
                  onPress={() => setLanguage(opt.code)}
                >
                  <View style={styles.optionLeft}>
                    <Text style={styles.emoji}>{opt.emoji}</Text>
                    <View style={styles.textWrap}>
                      <Text style={[styles.nativeTitle, isSelected && styles.nativeTitleSelected]}>
                        {opt.nativeTitle}
                      </Text>
                      <Text style={styles.subTitle}>{opt.title}</Text>
                    </View>
                  </View>

                  <View style={styles.optionRight}>
                    <View style={[styles.badgePill, isSelected && styles.badgePillSelected]}>
                      <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
                        {opt.badge}
                      </Text>
                    </View>

                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmBtn}
            activeOpacity={0.85}
            onPress={closeLanguageModal}
          >
            <Text style={styles.confirmBtnText}>{t('btn_confirm_language')} →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  optionsWrap: {
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  textWrap: {
    justifyContent: 'center',
  },
  nativeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  nativeTitleSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  subTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  badgePillSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  badgeTextSelected: {
    color: COLORS.primaryDark,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
