import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';

import { tr, useLanguage } from '../../../i18n/LanguageContext';
export default function CompletedChallengeCard({ item }) {
  useLanguage();
  // Support either { cycle, activity } or flat item
  const cycle = item.cycle || item;
  const activity = item.activity || item;

  const title = activity?.title || cycle?.title || 'Mission LiFE Quest';
  const category = (activity?.category || cycle?.category || 'energy').toUpperCase();
  const totalDays = cycle?.totalDurationDays || cycle?.durationDays || activity?.durationDays || 7;
  const actualCheckIns = cycle?.successfulCheckIns !== undefined ? cycle.successfulCheckIns : (activity?.requiredCheckIns || 5);
  const ecoEarned = cycle?.ecoScoreAwarded || activity?.ecoScoreReward || 5;
  const pointsEarned = cycle?.greenPointsAwarded || activity?.greenPointsReward || 25;
  const co2Saved = cycle?.carbonSavedKgCO2e || cycle?.calculationMetadata?.carbonSavingsKgCO2e || activity?.carbonSavingKgCO2e || null;

  const completedDate = cycle?.completedAt ? new Date(cycle.completedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : 'Recently';

  const categoryColor =
    category === 'TRANSPORT'
      ? '#0284C7'
      : category === 'WATER'
      ? '#2563EB'
      : category === 'WASTE'
      ? '#16A34A'
      : '#D97706';

  return (
    <Card style={styles.card} elevation="subtle">
      {/* Top Category + Status Row */}
      <View style={styles.topRow}>
        <View style={[styles.categoryBadge, { borderColor: categoryColor }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {category}
          </Text>
        </View>

        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{tr('🏆 Quest conquered!')}</Text>
        </View>
      </View>

      {/* Quest Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Challenge Duration & Actual Check-ins Details */}
      <View style={styles.statsRow}>
        <View style={styles.durationPill}>
          <Text style={styles.durationText}>⏱ {totalDays}-day challenge</Text>
        </View>
        <View style={styles.checkInCountPill}>
          <Text style={styles.checkInCountText}>
            ✓ {actualCheckIns}/{totalDays} check-ins completed
          </Text>
        </View>
      </View>

      {/* Rewards Earned Box */}
      <View style={styles.rewardsBox}>
        <View style={styles.rewardCol}>
          <Text style={styles.rewardVal}>⚡ +{ecoEarned}</Text>
          <Text style={styles.rewardLabel}>{tr('EcoScore')}</Text>
        </View>
        <View style={styles.rewardCol}>
          <Text style={styles.rewardVal}>🪙 +{pointsEarned}</Text>
          <Text style={styles.rewardLabel}>{tr('GreenPoints')}</Text>
        </View>
        {co2Saved ? (
          <View style={styles.rewardCol}>
            <Text style={[styles.rewardVal, { color: '#16A34A' }]}>🌱 ~{co2Saved}kg</Text>
            <Text style={styles.rewardLabel}>{tr('CO₂e Avoided')}</Text>
          </View>
        ) : null}
      </View>

      {/* Completed Timestamp footer */}
      <View style={styles.footerRow}>
        <Text style={styles.dateText}>Completed on {completedDate}</Text>
        <Text style={styles.verifiedBadge}>{tr('Verified Reward ✓')}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.sm,
    borderWidth: 1,
    backgroundColor: '#F8FAFC',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.full || 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  durationPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.sm,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  checkInCountPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.sm,
  },
  checkInCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  rewardsBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: RADII.md,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rewardCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  rewardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  verifiedBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
});
