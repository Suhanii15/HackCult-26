import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { formatInr } from '../utils/formatters';
import { useLanguage } from '../../../i18n/LanguageContext';
import { WalletIcon, ClockIcon, AlertTriangleIcon } from './SolarIcons';

export default function SolarStatCards({ year1SavingsInr, paybackYears, verdict }) {
  const { t } = useLanguage();

  const isNotRecommended = paybackYears === null || verdict === 'not_recommended';

  return (
    <View style={styles.container}>
      {/* Annual Savings Card */}
      <Card elevation="subtle" style={[styles.card, styles.savingsCard]}>
        <View style={styles.iconCircle}>
          <WalletIcon size={18} color={COLORS.primaryDark} />
        </View>
        <Text style={styles.cardLabel}>{t('solar_stat_annual_savings') || 'Annual Savings'}</Text>
        <Text style={styles.savingsValue}>{formatInr(year1SavingsInr)}</Text>
        <Text style={styles.subtext}>/ year on bills</Text>
      </Card>

      {/* Payback Period Card */}
      <Card elevation="subtle" style={[styles.card, isNotRecommended ? styles.warningCard : styles.paybackCard]}>
        <View style={[styles.iconCircle, isNotRecommended && styles.warningIconCircle]}>
          {isNotRecommended ? (
            <AlertTriangleIcon size={18} color={COLORS.danger} />
          ) : (
            <ClockIcon size={18} color={COLORS.info} />
          )}
        </View>
        <Text style={styles.cardLabel}>{t('solar_stat_payback_period') || 'Payback Period'}</Text>
        <Text style={[styles.paybackValue, isNotRecommended && styles.warningValue]}>
          {isNotRecommended
            ? t('solar_not_recommended') || 'Not recommended'
            : t('solar_payback_years', { years: paybackYears.toFixed(1) }) || `${paybackYears.toFixed(1)} yrs`}
        </Text>
        <Text style={styles.subtext}>
          {isNotRecommended ? 'Exceeds system lifetime' : 'Capital recovered'}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  card: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADII.xl,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  savingsCard: {
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
  },
  paybackCard: {
    borderTopWidth: 3,
    borderTopColor: COLORS.info,
  },
  warningCard: {
    borderTopWidth: 3,
    borderTopColor: COLORS.danger,
    backgroundColor: COLORS.dangerBg,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: RADII.full,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  warningIconCircle: {
    backgroundColor: '#FEE2E2',
  },
  cardLabel: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  savingsValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  paybackValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  warningValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.danger,
    lineHeight: 22,
  },
  subtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
