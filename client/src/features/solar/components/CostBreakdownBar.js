import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { formatInr } from '../utils/formatters';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function CostBreakdownBar({ financials }) {
  const { t } = useLanguage();

  if (!financials) return null;

  const {
    grossCostInr = 0,
    netInvestmentInr = 0,
    centralSubsidyInr = 0,
    stateSubsidyInr = 0,
  } = financials;

  const safeGross = Math.max(1, grossCostInr);
  const netPercent = Math.max(0, Math.min(100, (netInvestmentInr / safeGross) * 100));
  const centralPercent = Math.max(0, Math.min(100, (centralSubsidyInr / safeGross) * 100));
  const statePercent = stateSubsidyInr > 0 ? Math.max(0, Math.min(100, (stateSubsidyInr / safeGross) * 100)) : 0;

  return (
    <Card elevation="subtle" style={styles.card}>
      <Text style={styles.sectionTitle}>{t('solar_cost_breakdown_title') || 'Project Cost Breakdown'}</Text>

      {/* Main Net Investment Highlight */}
      <View style={styles.headlineContainer}>
        <Text style={styles.headlineLabel}>
          {t('solar_cost_net_investment') || 'Net customer investment'}
        </Text>
        <Text style={styles.headlineAmount}>{formatInr(netInvestmentInr)}</Text>
        <Text style={styles.grossSubtext}>
          {t('solar_cost_gross_cost') || 'Gross Project Cost'}: {formatInr(grossCostInr)}
        </Text>
      </View>

      {/* Segmented Horizontal Bar */}
      <View style={styles.barTrack} accessibilityLabel="Cost breakdown segmented bar">
        <View style={[styles.barSegment, { width: `${netPercent}%`, backgroundColor: COLORS.primary }]} />
        <View style={[styles.barSegment, { width: `${centralPercent}%`, backgroundColor: COLORS.accent }]} />
        {statePercent > 0 && (
          <View style={[styles.barSegment, { width: `${statePercent}%`, backgroundColor: COLORS.energy }]} />
        )}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <View style={styles.legendTextCol}>
            <Text style={styles.legendLabel}>{t('solar_cost_net_investment') || 'Net customer investment'}</Text>
            <Text style={styles.legendValue}>{formatInr(netInvestmentInr)}</Text>
          </View>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
          <View style={styles.legendTextCol}>
            <Text style={styles.legendLabel}>{t('solar_cost_central_subsidy') || 'PM Surya Ghar Subsidy'}</Text>
            <Text style={styles.legendValue}>−{formatInr(centralSubsidyInr)}</Text>
          </View>
        </View>

        {stateSubsidyInr > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.energy }]} />
            <View style={styles.legendTextCol}>
              <Text style={styles.legendLabel}>{t('solar_cost_state_subsidy') || 'State Subsidy'}</Text>
              <Text style={styles.legendValue}>−{formatInr(stateSubsidyInr)}</Text>
            </View>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  headlineContainer: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADII.lg,
    marginBottom: SPACING.md,
  },
  headlineLabel: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.primaryDark,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headlineAmount: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  grossSubtext: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  barTrack: {
    height: 16,
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: RADII.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  barSegment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: RADII.full,
    marginRight: SPACING.sm,
  },
  legendTextCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  legendValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
});
