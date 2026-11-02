import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function ActivityCard({ activity, onPress }) {
  const { t } = useLanguage();

  const title = activity.title || (activity.titleKey && t(activity.titleKey)) || 'Activity';
  const desc = activity.description || activity.desc || '';

  // Type label mapping
  let typeLabel = t('activity_type_daily_habit');
  let typeColor = '#00897B';
  let typeBg = '#E0F2F1';
  if (activity.activityType === 'one_time') {
    typeLabel = t('activity_type_one_time');
    typeColor = '#7C3AED';
    typeBg = '#EDE9FE';
  } else if (activity.activityType === 'periodic_goal') {
    typeLabel = t('activity_type_periodic_goal');
    typeColor = '#D97706';
    typeBg = '#FEF3C7';
  }

  // Duration label
  const durationText =
    activity.durationDays && activity.durationDays > 1
      ? t('activity_duration_days', { days: activity.durationDays })
      : t('activity_duration_onetime');

  // Status mapping
  const status = activity.userStatus || activity.status || 'available';
  let statusBadge = null;

  if (status === 'active' || activity.activeCycle) {
    const cycle = activity.activeCycle;
    const dayLabel = cycle ? t('progress_day_ratio', { current: cycle.currentDayIndex || 0, total: activity.durationDays || 7 }) : t('status_active');
    statusBadge = (
      <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
        <View style={styles.activeDot} />
        <Text style={[styles.statusText, { color: '#15803D' }]}>{dayLabel}</Text>
      </View>
    );
  } else if (status === 'completed') {
    statusBadge = (
      <View style={[styles.statusBadge, { backgroundColor: '#DBEAFE' }]}>
        <Text style={[styles.statusText, { color: '#1D4ED8' }]}>{t('status_completed')} ✓</Text>
      </View>
    );
  } else if (status === 'expired') {
    statusBadge = (
      <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
        <Text style={[styles.statusText, { color: '#6B7280' }]}>{t('status_expired')}</Text>
      </View>
    );
  }

  const ecoPts = activity.ecoScoreReward || 5;
  const greenPts = activity.greenPointsReward || activity.points || 20;

  return (
    <Card onPress={onPress} style={styles.card} elevation="subtle">
      {/* Top Header Row: Type chip, Duration, Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.typeAndDuration}>
          <View style={[styles.typeBadge, { backgroundColor: typeBg }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>⏱ {durationText}</Text>
          </View>
        </View>
        {statusBadge}
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Description */}
      {desc ? (
        <Text style={styles.desc} numberOfLines={2}>
          {desc}
        </Text>
      ) : null}

      {/* Footer: EcoScore & Green Points Rewards */}
      <View style={styles.footerRow}>
        <View style={styles.rewardsRow}>
          <View style={styles.ecoBadge}>
            <Text style={styles.ecoText}>⚡ {t('activity_ecoscore_badge', { pts: ecoPts })}</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>🌿 {t('activity_greenpoints_badge', { pts: greenPts })}</Text>
          </View>
        </View>
        <Text style={styles.arrowText}>➔</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  typeAndDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  durationBadge: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  durationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 22,
  },
  desc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ecoBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  ecoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  pointsBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});
