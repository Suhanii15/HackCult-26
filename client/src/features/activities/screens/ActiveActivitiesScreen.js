import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, ProgressBar, Toast, Skeleton, EmptyState, LungsLoader } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage, tr } from '../../../i18n/LanguageContext';
import { useActiveActivities, useDailyCheckIn } from '../hooks';
import {
  getCheckInSuccessMessage,
  getChallengeCompletionMessage,
  getEmptyActiveMessage,
  MICROCOPY,
} from '../../../constants/microcopy';

export default function ActiveActivitiesScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { data: activeList, isLoading, refetch, isRefetching } = useActiveActivities();
  const dailyCheckInMutation = useDailyCheckIn();

  const [toastMessage, setToastMessage] = useState(null);

  const handleCheckIn = (item, completed) => {
    const cyc = item?.cycle || item;
    const cycleId = cyc?._id || item?._id;
    if (!cycleId) return;

    dailyCheckInMutation.mutate(
      {
        cycleId,
        completed,
      },
      {
        onSuccess: (res) => {
          const isDone = res.justCompleted || res.cycle?.isCompleted;
          setToastMessage({
            type: 'success',
            msg: isDone
              ? getChallengeCompletionMessage()
              : getCheckInSuccessMessage(),
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

  const handleOpenDetail = (item) => {
    const cyc = item?.cycle || item;
    const act = item?.activity || cyc?.activityId || item?.activityId;
    const key =
      item?.activity?.activityId ||
      cyc?.activityId?.activityId ||
      (typeof cyc?.activityId === 'string' ? cyc.activityId : null) ||
      (typeof item?.activityId === 'string' ? item.activityId : null) ||
      item?.activityCode ||
      cyc?.activityCode ||
      act?.activityId ||
      act?._id ||
      cyc?._id;
    navigation.navigate('ActivityDetail', { key, activityId: key });
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
        <Text style={styles.headerTitle}>
          {MICROCOPY.activities.activeTitle}
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

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
          <LungsLoader label={tr('Loading your active quests...')} size={100} style={{ marginVertical: 40 }} />
        ) : activeList && activeList.length > 0 ? (
          activeList.map((item, index) => {
            const cyc = item?.cycle || item;
            const act = item?.activity || cyc?.activityId || item?.activityId;
            const title =
              act?.title ||
              (act?.titleKey && t(act.titleKey)) ||
              cyc?.title ||
              item?.title ||
              'Mission LiFE Quest';
            const totalDays = cyc?.totalDurationDays || cyc?.durationDays || act?.durationDays || 7;
            const required = cyc?.requiredCheckIns || act?.requiredCheckIns || 5;
            const currentDay = Math.min(totalDays, (cyc?.currentDayIndex || 0) + 1);
            const successful = cyc?.successfulCheckIns || 0;
            const checkedToday = Boolean(item?.todayCheckedIn || cyc?.hasCheckedInToday);
            const isMinAchieved = successful >= required;
            const cardKey = cyc?._id || item?._id || `active_${index}`;

            return (
              <Card
                key={cardKey}
                style={styles.card}
                elevation="subtle"
                onPress={() => handleOpenDetail(item)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.dayBadge, checkedToday && styles.doneTodayBadge]}>
                    <Text style={[styles.dayBadgeText, checkedToday && styles.doneTodayBadgeText]}>
                      {checkedToday
                        ? `✓ Checked In Today (Day ${currentDay}/${totalDays})`
                        : `Day ${currentDay} of ${totalDays}`}
                    </Text>
                  </View>
                  <Text style={styles.daysLeftText}>
                    {Math.max(0, totalDays - currentDay)} days remaining
                  </Text>
                </View>

                <Text style={styles.actTitle}>{title}</Text>

                {/* Progress Bar with Correct Math */}
                <View style={styles.progressSection}>
                  <ProgressBar
                    current={successful}
                    total={totalDays}
                    label={`${successful} of ${totalDays} check-ins completed`}
                    threshold={required}
                    thresholdLabel={
                      isMinAchieved
                        ? `🎉 Minimum requirement achieved (${successful}/${totalDays} days)! Keep going to maximize your streak.`
                        : `Complete at least ${required} of ${totalDays} days to earn your challenge rewards.`
                    }
                  />
                </View>

                {/* Daily Check-in Prompt */}
                <View style={styles.checkInBox}>
                  {checkedToday ? (
                    <View style={styles.checkedTodayContainer}>
                      <View style={styles.checkedTodayRow}>
                        <Text style={styles.checkedTodayIcon}>✓</Text>
                        <Text style={styles.checkedTodayText}>
                          {tr('Today\'s mission complete!')}
                        </Text>
                      </View>
                      <Text style={styles.nextCheckInNote}>
                        Next check-in unlocks tomorrow. Challenge continues until Day {totalDays}!
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.checkInQuestion}>
                        {tr('Did you practice this sustainability habit today?')}
                      </Text>
                      <View style={styles.checkInButtonsRow}>
                        <TouchableOpacity
                          style={[styles.checkInBtn, styles.checkInYesBtn]}
                          activeOpacity={0.8}
                          onPress={() => handleCheckIn(item, true)}
                          disabled={dailyCheckInMutation.isPending}
                        >
                          <Text style={styles.checkInYesText}>
                            {tr('✓ Done and dusted')}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.checkInBtn, styles.checkInNoBtn]}
                          activeOpacity={0.8}
                          onPress={() => handleCheckIn(item, false)}
                          disabled={dailyCheckInMutation.isPending}
                        >
                          <Text style={styles.checkInNoText}>
                            {tr('× Missed today')}
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
            icon="🎯"
            title={MICROCOPY.activities.activeTitle}
            message={getEmptyActiveMessage()}
            actionLabel={`${MICROCOPY.activities.buttons.start} ➔`}
            onAction={() => navigation.navigate('ActivityCategories')}
            style={styles.emptyContainer}
          />
        )}
      </ScrollView>

      {/* Global Toast Modal Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Toast
            message={toastMessage.msg}
            type={toastMessage.type}
            onDismiss={() => setToastMessage(null)}
          />
        </View>
      )}
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
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerRightPlaceholder: {
    width: 32,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 120,
  },
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  doneTodayBadge: {
    backgroundColor: '#DCFCE7',
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  doneTodayBadgeText: {
    color: '#15803D',
  },
  daysLeftText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  actTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  progressSection: {
    marginBottom: 12,
  },
  checkInBox: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  checkedTodayContainer: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: RADII.sm,
    borderColor: '#DCFCE7',
    borderWidth: 1,
  },
  checkedTodayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  checkedTodayIcon: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '800',
    marginRight: 6,
  },
  checkedTodayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  nextCheckInNote: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
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
    backgroundColor: '#16A34A',
  },
  checkInYesText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  checkInNoBtn: {
    backgroundColor: '#F3F4F6',
  },
  checkInNoText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 999,
  },
});
