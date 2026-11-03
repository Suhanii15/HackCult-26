import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AlertTriangleIcon, InfoIcon, BuildingIcon, MapPinIcon } from './SolarIcons';

export default function SolarEdgeBanner({
  hasEstimates,
  isApartment,
  isOutOfState,
  infeasibleReason,
  limitingFactor,
}) {
  const { t } = useLanguage();

  // If infeasible state
  if (infeasibleReason) {
    return (
      <Card elevation="subtle" style={[styles.card, styles.infeasibleCard]}>
        <View style={styles.infeasibleHeader}>
          <AlertTriangleIcon size={24} color={COLORS.danger} />
          <Text style={styles.infeasibleTitle}>
            {t('solar_edge_infeasible_title') || 'Solar Setup Currently Infeasible'}
          </Text>
        </View>
        <Text style={styles.infeasibleMessage}>{infeasibleReason}</Text>

        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionTitle}>Recommendation:</Text>
          <Text style={styles.suggestionText}>
            {limitingFactor === 'roof'
              ? 'Rooftop solar requires at least 100 sq.ft of shadow-free area for a standard 1 kW system. Consider community solar or high-efficiency bifacial panels.'
              : 'Your electricity consumption is too low to offset the capital expenditure of a 1 kW grid-tied solar system. You may revisit as your household appliances expand.'}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.bannersContainer}>
      {/* Estimate Warning Banner */}
      {hasEstimates && (
        <View style={styles.estimateBanner}>
          <InfoIcon size={16} color="#92400E" />
          <Text style={styles.estimateText}>
            {t('solar_banner_estimates_warning') || 'Some inputs are estimates'}
          </Text>
        </View>
      )}

      {/* Apartment Society / RWA NOC Notice */}
      {isApartment && (
        <View style={styles.apartmentBanner}>
          <BuildingIcon size={16} color="#1E40AF" />
          <Text style={styles.apartmentText}>
            {t('solar_edge_apartment_note') ||
              'Apartment Notice: Common rooftop installations require Society / RWA No Objection Certificate (NOC).'}
          </Text>
        </View>
      )}

      {/* Out of State Notice */}
      {isOutOfState && (
        <View style={styles.outOfStateBanner}>
          <MapPinIcon size={16} color={COLORS.textSecondary} />
          <Text style={styles.outOfStateText}>
            {t('solar_edge_nongujarat_note') ||
              'Out-of-state Notice: Central PM Surya Ghar subsidy applied. State top-up is calibrated for Gujarat.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bannersContainer: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  estimateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningBg,
    borderRadius: RADII.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
  },
  apartmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoBg,
    borderRadius: RADII.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 8,
  },
  outOfStateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  estimateText: {
    ...TYPOGRAPHY.subtext,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  apartmentText: {
    ...TYPOGRAPHY.subtext,
    color: '#1E40AF',
    flex: 1,
  },
  outOfStateText: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    flex: 1,
  },
  card: {
    marginVertical: SPACING.sm,
  },
  infeasibleCard: {
    backgroundColor: COLORS.dangerBg,
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: RADII.xl,
  },
  infeasibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: 8,
  },
  infeasibleTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.danger,
    flex: 1,
  },
  infeasibleMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  suggestionBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  suggestionTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  suggestionText: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
