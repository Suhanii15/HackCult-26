import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Chip } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { useLanguage, tr } from '../../../i18n/LanguageContext';
import { SunIcon, ZapIcon } from './SolarIcons';
import SolarGenerationWave from './SolarGenerationWave';

export default function SolarHeroCard({ capacityKw = 3.0, limitingFactor, annualGenerationKwh = 4500 }) {
  const { t } = useLanguage();

  let limitingLabel = t('solar_limiting_consumption') || 'Sized to your usage';
  let limitingEase = 'easy';

  if (limitingFactor === 'roof') {
    limitingLabel = t('solar_limiting_roof') || 'Limited by roof area';
    limitingEase = 'medium';
  } else if (limitingFactor === 'max') {
    limitingLabel = t('solar_limiting_max') || 'Maximum size (10 kWp)';
    limitingEase = 'easy';
  }

  const estimatedRoofSqft = Math.round(capacityKw * 100);

  return (
    <Card elevation="subtle" style={styles.card}>
      {/* Card Header */}
      <View style={styles.topRow}>
        <View style={styles.headerLeftCol}>
          <Text style={styles.eyebrow}>
            {t('solar_hero_capacity_title') || 'Recommended Solar System'}
          </Text>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityNumber}>{capacityKw.toFixed(1)}</Text>
            <Text style={styles.capacityUnit}>{tr('kWp')}</Text>
          </View>
        </View>

        <Chip label={limitingLabel} ease={limitingEase} style={styles.limitingChip} />
      </View>

      {/* Diurnal Solar Generation Wave Chart from Reference UI */}
      <SolarGenerationWave peakKw={capacityKw} />

      {/* Bottom Summary Pill Badges from Reference Card */}
      <View style={styles.pillsRow}>
        <View style={[styles.pillBox, styles.pillBoxActive]}>
          <Text style={styles.pillLabelActive}>{tr('Capacity')}</Text>
          <Text style={styles.pillValActive}>{`${capacityKw.toFixed(1)} kWp`}</Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>{tr('Annual Gen')}</Text>
          <Text style={styles.pillVal}>
            {`${Math.round(annualGenerationKwh).toLocaleString('en-IN')} kWh`}
          </Text>
        </View>

        <View style={styles.pillBox}>
          <Text style={styles.pillLabel}>{tr('Roof Used')}</Text>
          <Text style={styles.pillVal}>{`~${estimatedRoofSqft} sq.ft`}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.15)',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  headerLeftCol: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  capacityNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  capacityUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 6,
  },
  limitingChip: {
    maxWidth: '55%',
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
  },
  pillBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillBoxActive: {
    backgroundColor: '#FEF3C7', // Solar golden highlight from reference image
    borderColor: '#FDE68A',
  },
  pillLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  pillVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  pillLabelActive: {
    fontSize: 10,
    color: '#B45309',
    fontWeight: '700',
    marginBottom: 2,
  },
  pillValActive: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
});
