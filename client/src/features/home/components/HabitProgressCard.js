import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ProgressBar, Button } from '../../../components/ui';
import { COLORS, SPACING } from '../../../theme';
import { useLanguage, tr } from '../../../i18n/LanguageContext';

export default function HabitProgressCard({
  streakDays = 4,
  targetDays = 7,
  onExploreActivities,
}) {
  const { t } = useLanguage();

  return (
    <Card style={styles.card} elevation="subtle">
      <View style={styles.headerRow}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>🔥 {streakDays} {t('days_streak', { count: streakDays })}</Text>
        </View>
        <Text style={styles.pointsPill}>{tr('+15 pts/day')}</Text>
      </View>

      <Text style={styles.title}>{t('home_streak_title')}</Text>
      <Text style={styles.desc}>
        {t('task_ac_24_title')}
      </Text>

      <ProgressBar
        current={streakDays}
        total={targetDays}
        label={t('days_progress', { current: streakDays, total: targetDays })}
        color={COLORS.accent}
        style={styles.progressBar}
      />

      <Button
        title={t('tab_activities') + ' ➔'}
        variant="secondary"
        size="sm"
        onPress={onExploreActivities}
        style={styles.exploreBtn}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badgePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  pointsPill: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 19,
  },
  progressBar: {
    marginVertical: SPACING.xs,
  },
  exploreBtn: {
    marginTop: SPACING.sm,
  },
});
