import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, ProgressBar, Toast, Skeleton, EmptyState } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useActiveActivities, useDailyCheckIn } from '../hooks';

export default function ActiveActivitiesScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { data: activeList, isLoading, refetch, isRefetching } = useActiveActivities();
  const dailyCheckInMutation = useDailyCheckIn();

  const [toastMessage, setToastMessage] = useState(null);

  const handleCheckIn = (cycle, completed) => {
    dailyCheckInMutation.mutate(
      {
        cycleId: cycle._id,
        completed,
      },
      {
        onSuccess: (res) => {
          setToastMessage({
            type: 'success',
            msg: res.cycle?.isCompleted
              ? t('cycle_completed_badge')
              : t('checkin_recorded_success'),
          });
          refetch();
        },
        onError: (err) => {
          setToastMessage({
            type: 'error',
            msg: err.message || 'Check-in failed. Please try again.',
          });
        },
      }
    );
  };

  const handleOpenDetail = (cycle) => {
    const act = cycle.activityId;
    const key = act?.activityId || cycle.activityCode || act?._id;
    navigation.navigate('ActivityDetail', { key });
  };

  return (
    <View style={styles.container}>
      {/* Custom Sub-header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel={t('back')}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('active_activities_screen_title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {toastMessage ? (
        <View style={styles.toastContainer}>
          <Toast
            message={toastMessage.msg}
            type={toastMessage.type}
            onDismiss={() => setToastMessage(null)}
          />
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Skeleton height={150} style={styles.skeleton} />
            <Skeleton height={150} style={styles.skeleton} />
          </View>
        ) : activeList && activeList.length > 0 ? (
          activeList.map((cycle) => {
            const act = cycle.activityId || {};
            const title = act.title || cycle.activityCode || 'Challenge';
            const totalDays = cycle.totalDurationDays || 7;
            const currentDay = cycle.currentDayIndex || 0;
            const required = cycle.requiredCheckIns || 6;
            const successful = cycle.successfulCheckIns || 0;
            const checkedToday = cycle.hasCheckedInToday;

            return (
              <Card
                key={cycle._id}
                style={styles.card}
                elevation="subtle"
                onPress={() => handleOpenDetail(cycle)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>
                      {t('progress_day_ratio', {
                        current: currentDay,
                        total: totalDays,
                      })}
                    </Text>
                  </View>
                  <Text style={styles.daysLeftText}>
                    {t('progress_days_left', {
                      days: Math.max(0, totalDays - currentDay),
                    })}
                  </Text>
                </View>

                <Text style={styles.actTitle}>{title}</Text>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                  <ProgressBar
                    value={successful}
                    total={required}
                    label={t('progress_checkins_ratio', {
                      done: successful,
                      required,
                    })}
                  />
                </View>

                {/* Daily Check-in Prompt */}
                <View style={styles.checkInBox}>
                  {checkedToday ? (
                    <View style={styles.checkedTodayRow}>
                      <Text style={styles.checkedTodayIcon}>✓</Text>
                      <Text style={styles.checkedTodayText}>
                        {t('checkin_already_done_today')}
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.checkInQuestion}>
                        {t('checkin_today_question')}
                      </Text>
                      <View style={styles.checkInButtonsRow}>
                        <TouchableOpacity
                          style={[styles.checkInBtn, styles.checkInYesBtn]}
                          activeOpacity={0.8}
                          onPress={() => handleCheckIn(cycle, true)}
                          disabled={dailyCheckInMutation.isPending}
                        >
                          <Text style={styles.checkInYesText}>
                            ✓ {t('checkin_btn_yes')}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.checkInBtn, styles.checkInNoBtn]}
                          activeOpacity={0.8}
                          onPress={() => handleCheckIn(cycle, false)}
                          disabled={dailyCheckInMutation.isPending}
                        >
                          <Text style={styles.checkInNoText}>
                            × {t('checkin_btn_no')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            title={t('activities_active_badge')}
            message={t('active_activities_empty')}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 6,
    marginRight: SPACING.sm,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
    paddingBottom: 40,
  },
  toastContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  daysLeftText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  actTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  progressSection: {
    marginVertical: SPACING.sm,
  },
  checkInBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginTop: 6,
  },
  checkedTodayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkedTodayIcon: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '800',
    marginRight: 6,
  },
  checkedTodayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
  },
  checkInQuestion: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  checkInButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkInBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADII.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInYesBtn: {
    backgroundColor: COLORS.primaryDark,
  },
  checkInYesText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  checkInNoBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkInNoText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingHorizontal: SPACING.md,
  },
  skeleton: {
    marginBottom: SPACING.md,
    borderRadius: RADII.lg,
  },
});
