import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { LeafIcon } from './SolarIcons';

export default function SolarCo2Card({ lifetimeCo2AvoidedTonnes, totalLifetimeGenerationKwh }) {
  const { t } = useLanguage();

  if (lifetimeCo2AvoidedTonnes === undefined || lifetimeCo2AvoidedTonnes === null) return null;

  const treesPlantedEquivalent = Math.round(lifetimeCo2AvoidedTonnes * 1.6);

  return (
    <Card elevation="subtle" style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.iconCircle}>
          <LeafIcon size={24} color={COLORS.primary} />
        </View>

        <View style={styles.textCol}>
          <Text style={styles.title}>{t('solar_co2_avoided_title') || 'Lifetime CO₂ Avoided'}</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricNumber}>{lifetimeCo2AvoidedTonnes.toFixed(1)}</Text>
            <Text style={styles.metricUnit}>{t('solar_co2_avoided_unit') || 'tonnes CO₂'}</Text>
          </View>
          <Text style={styles.subtitle}>
            Equal to planting ~{treesPlantedEquivalent} mature trees over 25 years
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: SPACING.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: RADII.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textCol: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
    marginBottom: 2,
  },
  metricNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  metricUnit: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  subtitle: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
