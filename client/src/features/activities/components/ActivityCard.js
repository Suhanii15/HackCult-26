import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage, tr } from '../../../i18n/LanguageContext';
import { formatCarbonLine } from '../utils/discovery';

const DIFFICULTY_STYLES = {
  easy: { bg: '#DCFCE7', text: '#15803D', label: 'Easy' },
  medium: { bg: '#FEF3C7', text: '#B45309', label: 'Medium' },
  hard: { bg: '#FEE2E2', text: '#B91C1C', label: 'Hard' },
};

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

  // Difficulty style
  const diffStyle = DIFFICULTY_STYLES[activity.difficulty] || DIFFICULTY_STYLES.easy;

  // Time requirement
  const timeText = activity.timeRequiredText || (activity.estimatedMinutes ? `${activity.estimatedMinutes} min` : null);

  // Carbon saving summary
  const carbonLine = formatCarbonLine(activity);

  // Status mapping
  const status = activity.userStatus || activity.status || 'available';
  const isActive = status === 'active' || Boolean(activity.activeCycle);
  const cycle = activity.activeCycle;
  const checkedToday = Boolean(cycle?.hasCheckedInToday || activity.todayCheckedIn);

  let statusBadge = null;
  if (isActive) {
    const dayLabel = cycle
      ? t('progress_day_ratio', { current: cycle.currentDayIndex || 0, total: activity.durationDays || 7 })
      : t('status_active');
    statusBadge = (
      <View style={[styles.statusBadge, { backgroundColor: checkedToday ? '#DCFCE7' : '#E0F2FE' }]}>
        <View style={[styles.activeDot, { backgroundColor: checkedToday ? '#15803D' : '#0284C7' }]} />
        <Text style={[styles.statusText, { color: checkedToday ? '#15803D' : '#0369A1' }]}>
          {checkedToday ? `✓ Done Today (${dayLabel})` : `● ${dayLabel}`}
        </Text>
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
      {/* Top Header Row: Type chip, Difficulty chip, Time chip, Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.typeAndDifficulty}>
          <View style={[styles.badge, { backgroundColor: typeBg }]}>
            <Text style={[styles.badgeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: diffStyle.bg }]}>
            <Text style={[styles.badgeText, { color: diffStyle.text }]}>{diffStyle.label}</Text>
          </View>
          {timeText ? (
            <View style={[styles.badge, styles.timeBadge]}>
              <Text style={styles.timeBadgeText}>⏱ {timeText}</Text>
            </View>
          ) : null}
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

      {/* Carbon Saving Line */}
      {carbonLine ? (
        <View style={styles.carbonRow}>
          <Text style={styles.carbonText} numberOfLines={1}>
            🌱 {carbonLine}
          </Text>
        </View>
      ) : null}

      {/* Footer: EcoScore & Green Points Rewards + Action Indicator */}
      <View style={styles.footerRow}>
        <View style={styles.rewardsRow}>
          <View style={styles.ecoBadge}>
            <Text style={styles.ecoText}>⚡ +{ecoPts} EcoScore</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>🌿 +{greenPts} GP</Text>
          </View>
        </View>
        <View style={styles.actionIndicator}>
          {isActive ? (
            <View style={styles.continuePill}>
              <Text style={styles.continuePillText}>{tr('Continue ➔')}</Text>
            </View>
          ) : status === 'completed' ? (
            <View style={styles.completedPill}>
              <Text style={styles.completedPillText}>{tr('View Details ➔')}</Text>
            </View>
          ) : (
            <Text style={styles.arrowText}>➔</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.white,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  typeAndDifficulty: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeBadge: {
    backgroundColor: '#F3F4F6',
  },
  timeBadgeText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
    marginLeft: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#15803D',
    marginRight: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 22,
  },
  desc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  carbonRow: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.sm,
    marginTop: 4,
    marginBottom: SPACING.xs,
  },
  carbonText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
    fontSize: 12,
    color: '#B45309',
    fontWeight: '700',
  },
  pointsBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  pointsText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
  },
  actionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continuePill: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: '#80CBC4',
  },
  continuePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00695C',
  },
  completedPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.full,
  },
  completedPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  arrowText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
});
