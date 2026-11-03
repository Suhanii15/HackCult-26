import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function SnapshotSection({
  monthlyCO2Kg = 128,
  ecoScore = 72,
  activeCount = 2,
  onSeeAll,
  onOpenActivities,
  onOpenFootprint,
}) {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {/* Section Header: Your Snapshot + See all */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('your_snapshot')}</Text>
        <TouchableOpacity
          onPress={onSeeAll || onOpenActivities}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.seeAllText}>{t('see_all')}</Text>
        </TouchableOpacity>
      </View>

      {/* Two Column Grid */}
      <View style={styles.gridRow}>
        {/* Card 1: Carbon Footprint */}
        <Card
          style={styles.gridCard}
          elevation="subtle"
          onPress={onOpenFootprint}
        >
          <View style={styles.iconCircleCyan}>
            <Text style={styles.iconText}>👣</Text>
          </View>
          <Text style={styles.cardLabel}>{t('carbon_footprint')}</Text>
          <Text style={styles.cardValue}>{Math.round(monthlyCO2Kg)}</Text>
          <Text style={styles.cardUnit}>kg CO₂</Text>
        </Card>

        {/* Card 2: Eco Score */}
        <Card
          style={styles.gridCard}
          elevation="subtle"
          onPress={onOpenActivities}
        >
          <View style={styles.iconCircleTeal}>
            <Text style={styles.iconText}>🌿</Text>
          </View>
          <Text style={styles.cardLabel}>{t('eco_score')}</Text>
          <Text style={styles.cardValue}>{ecoScore}</Text>
          <Text style={styles.cardGoodUnit}>{t('eco_score_good')}</Text>
        </Card>
      </View>

      {/* Horizontal Card: Active Habits in progress */}
      <Card
        style={styles.horizontalCard}
        elevation="subtle"
        onPress={onOpenActivities}
      >
        <View style={styles.horizontalLeft}>
          <View style={styles.horizontalIconCircle}>
            <Text style={styles.iconText}>🌱</Text>
          </View>
          <Text style={styles.horizontalTitle}>{t('eco_score')}</Text>
        </View>

        <View style={styles.horizontalRight}>
          <Text style={styles.horizontalCount}>{activeCount}</Text>
          <Text style={styles.horizontalStatus}>{t('in_progress')}</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary, // Brand teal #00897B
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(224, 242, 241, 0.8)',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircleCyan: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconCircleTeal: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2F1', // Brand mint tint
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 18,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#004D40', // Brand deep teal
    lineHeight: 32,
  },
  cardUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  cardGoodUnit: {
    fontSize: 12,
    color: COLORS.primary, // Brand teal #00897B
    fontWeight: '700',
    marginTop: 1,
  },
  horizontalCard: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(224, 242, 241, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  horizontalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2F1', // Brand mint tint
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  horizontalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004D40',
  },
  horizontalRight: {
    alignItems: 'flex-end',
  },
  horizontalCount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#004D40',
    lineHeight: 22,
  },
  horizontalStatus: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
