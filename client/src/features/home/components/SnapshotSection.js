import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  FootprintIcon,
  EcoCycleIcon,
  EarthSproutIcon,
} from './HomeIcons';

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
            <FootprintIcon size={20} color="#00897B" />
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
          <View style={styles.iconCircleGreen}>
            <EcoCycleIcon size={20} color="#10B981" />
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
            <EarthSproutIcon size={24} color="#00897B" />
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
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircleCyan: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircleGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  cardUnit: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  cardGoodUnit: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },
  horizontalCard: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  horizontalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  horizontalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  horizontalRight: {
    alignItems: 'flex-end',
  },
  horizontalCount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
  },
  horizontalStatus: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
});
