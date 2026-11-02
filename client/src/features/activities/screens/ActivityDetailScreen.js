import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, ProgressBar, Toast, Skeleton, Button } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  useActivityDetail,
  useStartActivity,
  useAlreadyAchieved,
  useDismissActivity,
  useDailyCheckIn,
  useToggleLike,
} from '../hooks';

export default function ActivityDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();

  const activityKey = route.params?.key || 'energy_switch_off_unused';

  const {
    data: detailData,
    isLoading,
    refetch,
    isRefetching,
  } = useActivityDetail(activityKey);

  const startMutation = useStartActivity();
  const alreadyAchievedMutation = useAlreadyAchieved();
  const dismissMutation = useDismissActivity();
  const dailyCheckInMutation = useDailyCheckIn();
  const toggleLikeMutation = useToggleLike();

  const [toastMessage, setToastMessage] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const activity = detailData?.activity || detailData;
  const userCycle = detailData?.activeCycle || (activity?.userStatus === 'active' ? activity?.activeCycle : null);
  const status = detailData?.userStatus || activity?.userStatus || 'available';
  const checkInsHistory = detailData?.checkIns || [];

  const title = activity?.title || (activity?.titleKey && t(activity?.titleKey)) || 'Activity';
  const categoryName = activity?.category
    ? t(`cat_${activity.category}_name`) || activity.category
    : 'Mission LiFE';

  const durationDays = activity?.durationDays || (activity?.activityType === 'one_time' ? 1 : 7);
  const isOneTime = activity?.activityType === 'one_time';
  const ecoScore = activity?.ecoScoreReward || 5;
  const greenPoints = activity?.greenPointsReward || 20;

  // Action A: Add to my goals
  const handleAddToGoals = () => {
    if (!activity) return;
    startMutation.mutate(activity.activityId || activity.id, {
      onSuccess: () => {
        setToastMessage({
          type: 'success',
          msg: t('status_active') + '! Goal added to your active challenges.',
        });
        refetch();
      },
      onError: (err) => {
        setToastMessage({
          type: 'error',
          msg: err.message || 'Could not start goal. Please try again.',
        });
      },
    });
  };

  // Action B: Already achieved (triggers confirmation modal for one-time, blocks multi-day)
  const handlePressAlreadyAchieved = () => {
    if (!activity) return;

    if (activity.activityType !== 'one_time') {
      setToastMessage({
        type: 'info',
        msg: t('habit_cannot_bypass_error'),
      });
      return;
    }

    setConfirmModalVisible(true);
  };

  const handleConfirmAlreadyAchieved = () => {
    setConfirmModalVisible(false);
    alreadyAchievedMutation.mutate(activity.activityId || activity.id, {
      onSuccess: (res) => {
        setToastMessage({
          type: 'success',
          msg: `${t('status_completed')}! +${res.pointsEarned || greenPoints} Green Points & +${res.ecoScoreAwarded || ecoScore} EcoScore!`,
        });
        refetch();
      },
      onError: (err) => {
        setToastMessage({
          type: 'error',
          msg: err.message || 'Could not confirm completion.',
        });
      },
    });
  };

  // Action C: Not for me
  const handleDismiss = () => {
    if (!activity) return;
    dismissMutation.mutate(activity.activityId || activity.id, {
      onSuccess: () => {
        navigation.goBack();
      },
      onError: (err) => {
        setToastMessage({
          type: 'error',
          msg: err.message || 'Could not dismiss activity.',
        });
      },
    });
  };

  // Daily Check-in submit
  const handleCheckIn = (completed) => {
    if (!userCycle) return;
    dailyCheckInMutation.mutate(
      {
        cycleId: userCycle._id,
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
            msg: err.message || 'Check-in failed.',
          });
        },
      }
    );
  };

  // Restart challenge from Day 0 (for completed or expired)
  const handleRestartChallenge = () => {
    handleAddToGoals();
  };

  const handleToggleLike = () => {
    if (!activity) return;
    setIsLiked(!isLiked);
    toggleLikeMutation.mutate(activity.activityId || activity.id);
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
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
          {categoryName}
        </Text>
        <TouchableOpacity
          onPress={handleToggleLike}
          style={styles.likeButton}
          activeOpacity={0.7}
        >
          <Text style={styles.likeIcon}>{isLiked ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
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
        {isLoading || !activity ? (
          <View style={styles.loadingContainer}>
            <Skeleton height={200} style={styles.skeleton} />
            <Skeleton height={140} style={styles.skeleton} />
            <Skeleton height={140} style={styles.skeleton} />
          </View>
        ) : (
          <View>
            {/* Top Overview Card */}
            <Card style={styles.mainCard} elevation="subtle">
              {/* Badges: Type & Duration */}
              <View style={styles.badgesRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {isOneTime
                      ? t('activity_type_one_time')
                      : t('activity_type_daily_habit')}
                  </Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationBadgeText}>
                    ⏱{' '}
                    {isOneTime
                      ? t('activity_duration_onetime')
                      : t('activity_duration_days', { days: durationDays })}
                  </Text>
                </View>
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.desc}>{activity.description}</Text>

              {/* Rewards Summary Row */}
              <View style={styles.rewardsBox}>
                <Text style={styles.rewardsBoxTitle}>
                  {t('activity_rewards_label')}
                </Text>
                <View style={styles.rewardBadgesRow}>
                  <View style={styles.rewardPillEco}>
                    <Text style={styles.rewardPillEcoText}>
                      ⚡ {t('activity_ecoscore_badge', { pts: ecoScore })}
                    </Text>
                  </View>
                  <View style={styles.rewardPillPoints}>
                    <Text style={styles.rewardPillPointsText}>
                      🌿 {t('activity_greenpoints_badge', { pts: greenPoints })}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* LIVE CYCLE STATUS SECTION (Active, Completed, or Expired) */}
            {status === 'active' && userCycle ? (
              <Card style={styles.statusCard} elevation="subtle">
                <View style={styles.activeHeaderRow}>
                  <View style={styles.activeDot} />
                  <Text style={styles.statusCardTitle}>{t('status_active')}</Text>
                  <Text style={styles.dayIndexText}>
                    {t('progress_day_ratio', {
                      current: userCycle.currentDayIndex || 0,
                      total: durationDays,
                    })}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarWrapper}>
                  <ProgressBar
                    value={userCycle.successfulCheckIns || 0}
                    total={userCycle.requiredCheckIns || 6}
                    label={t('progress_checkins_ratio', {
                      done: userCycle.successfulCheckIns || 0,
                      required: userCycle.requiredCheckIns || 6,
                    })}
                  />
                </View>

                {/* Daily Check-in Prompt */}
                <View style={styles.checkInBox}>
                  {userCycle.hasCheckedInToday ? (
                    <View style={styles.checkedTodayBox}>
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
                          onPress={() => handleCheckIn(true)}
                          disabled={dailyCheckInMutation.isPending}
                        >
                          <Text style={styles.checkInYesText}>
                            ✓ {t('checkin_btn_yes')}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.checkInBtn, styles.checkInNoBtn]}
                          activeOpacity={0.8}
                          onPress={() => handleCheckIn(false)}
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
            ) : null}

            {status === 'completed' ? (
              <Card style={styles.completedCard} elevation="subtle">
                <Text style={styles.completedTitle}>
                  {t('cycle_completed_badge')}
                </Text>
                <Text style={styles.completedSub}>
                  {t('cycle_completed_rewards', {
                    pts: greenPoints,
                    eco: ecoScore,
                  })}
                </Text>

                {detailData?.canRestartTomorrow ? (
                  <View style={styles.restartTomorrowNotice}>
                    <Text style={styles.restartTomorrowText}>
                      ℹ️ {t('cycle_restart_tomorrow_notice')}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.restartButton}
                    activeOpacity={0.8}
                    onPress={handleRestartChallenge}
                    disabled={startMutation.isPending}
                  >
                    <Text style={styles.restartButtonText}>
                      🔄 {t('cycle_restart_button')}
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>
            ) : null}

            {status === 'expired' ? (
              <Card style={styles.expiredCard} elevation="subtle">
                <Text style={styles.expiredTitle}>
                  {t('cycle_expired_badge')}
                </Text>
                <Text style={styles.expiredSub}>
                  {t('cycle_expired_desc')}
                </Text>
                <TouchableOpacity
                  style={styles.restartButton}
                  activeOpacity={0.8}
                  onPress={handleRestartChallenge}
                  disabled={startMutation.isPending}
                >
                  <Text style={styles.restartButtonText}>
                    🔄 {t('cycle_restart_button')}
                  </Text>
                </TouchableOpacity>
              </Card>
            ) : null}

            {/* Why This Activity Matters Card */}
            {activity.whyItMatters ? (
              <Card style={styles.infoCard} elevation="subtle">
                <View style={styles.infoCardHeader}>
                  <Text style={styles.infoCardIcon}>🌱</Text>
                  <Text style={styles.infoCardTitle}>
                    {t('activity_why_matters')}
                  </Text>
                </View>
                <Text style={styles.infoCardBody}>
                  {activity.whyItMatters}
                </Text>
              </Card>
            ) : null}

            {/* Instructions & Guidelines Card */}
            {activity.instructions ? (
              <Card style={styles.infoCard} elevation="subtle">
                <View style={styles.infoCardHeader}>
                  <Text style={styles.infoCardIcon}>📋</Text>
                  <Text style={styles.infoCardTitle}>
                    {t('activity_instructions')}
                  </Text>
                </View>
                <Text style={styles.infoCardBody}>
                  {activity.instructions}
                </Text>
              </Card>
            ) : null}

            {/* Completion Criteria Card */}
            {activity.completionCriteria ? (
              <Card style={styles.infoCard} elevation="subtle">
                <View style={styles.infoCardHeader}>
                  <Text style={styles.infoCardIcon}>🎯</Text>
                  <Text style={styles.infoCardTitle}>
                    {t('activity_completion_criteria')}
                  </Text>
                </View>
                <Text style={styles.infoCardBody}>
                  {activity.completionCriteria}
                </Text>
                <Text style={styles.cadenceHint}>
                  {isOneTime
                    ? `• ${t('activity_cadence_once')}`
                    : `• ${t('activity_cadence_daily')}`}
                </Text>
              </Card>
            ) : null}

            {/* Check-ins History (if any) */}
            {checkInsHistory.length > 0 ? (
              <Card style={styles.infoCard} elevation="subtle">
                <Text style={styles.infoCardTitle}>
                  {t('cycle_history_title')}
                </Text>
                <View style={styles.historyList}>
                  {checkInsHistory.map((item, idx) => (
                    <View key={item._id || idx} style={styles.historyRow}>
                      <Text style={styles.historyDate}>
                        {new Date(item.checkInDate).toLocaleDateString()}
                      </Text>
                      <Text
                        style={[
                          styles.historyStatus,
                          { color: item.completed ? '#16A34A' : '#DC2626' },
                        ]}
                      >
                        {item.completed ? '✓ Completed' : '× Missed'}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* BOTTOM ACTIONS (Action A, B, C) - Shown when Available or Expired */}
      {status === 'available' ? (
        <View style={styles.bottomBar}>
          {/* Action A: Add to my goals */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.addGoalBtn]}
            activeOpacity={0.8}
            onPress={handleAddToGoals}
            disabled={startMutation.isPending}
          >
            <Text style={styles.addGoalBtnIcon}>+</Text>
            <Text style={styles.addGoalBtnText}>
              {t('action_add_to_goals')}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActionsRow}>
            {/* Action B: Already achieved */}
            <TouchableOpacity
              style={[styles.secondaryBtn, styles.achievedBtn]}
              activeOpacity={0.8}
              onPress={handlePressAlreadyAchieved}
              disabled={alreadyAchievedMutation.isPending}
            >
              <Text style={styles.achievedBtnIcon}>✓</Text>
              <Text style={styles.secondaryBtnText}>
                {t('action_already_achieved')}
              </Text>
            </TouchableOpacity>

            {/* Action C: Not for me */}
            <TouchableOpacity
              style={[styles.secondaryBtn, styles.dismissBtn]}
              activeOpacity={0.8}
              onPress={handleDismiss}
              disabled={dismissMutation.isPending}
            >
              <Text style={styles.dismissBtnIcon}>×</Text>
              <Text style={styles.secondaryBtnText}>
                {t('action_not_for_me')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* CONFIRMATION MODAL for Action B: Already Achieved */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('action_already_achieved_confirm_title')}
            </Text>
            <Text style={styles.modalDesc}>
              {t('action_already_achieved_confirm_desc')}
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                activeOpacity={0.8}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>
                  {t('action_already_achieved_btn_cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                activeOpacity={0.8}
                onPress={handleConfirmAlreadyAchieved}
              >
                <Text style={styles.modalConfirmText}>
                  {t('action_already_achieved_btn_confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  likeButton: {
    padding: 6,
  },
  likeIcon: {
    fontSize: 20,
  },
  toastContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
    paddingBottom: 120,
  },
  loadingContainer: {
    paddingHorizontal: SPACING.md,
  },
  skeleton: {
    marginBottom: SPACING.md,
    borderRadius: RADII.lg,
  },
  mainCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.lg,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.xs,
  },
  typeBadge: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
  },
  typeBadgeText: {
    color: '#00796B',
    fontSize: 12,
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
  durationBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginVertical: 6,
  },
  desc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  rewardsBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginTop: 4,
  },
  rewardsBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  rewardBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardPillEco: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.sm,
  },
  rewardPillEcoText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
  },
  rewardPillPoints: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.sm,
  },
  rewardPillPointsText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  statusCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.lg,
    borderColor: '#86EFAC',
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4',
  },
  activeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  statusCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
    flex: 1,
  },
  dayIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  progressBarWrapper: {
    marginVertical: SPACING.xs,
  },
  checkInBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  checkedTodayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
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
    fontWeight: '700',
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
  completedCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.lg,
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderWidth: 1.5,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  completedSub: {
    fontSize: 13,
    color: '#1E40AF',
    marginBottom: 8,
  },
  restartTomorrowNotice: {
    backgroundColor: '#DBEAFE',
    padding: SPACING.sm,
    borderRadius: RADII.sm,
  },
  restartTomorrowText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  restartButton: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 10,
    borderRadius: RADII.sm,
    alignItems: 'center',
    marginTop: 6,
  },
  restartButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  expiredCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.lg,
    backgroundColor: '#F9FAFB',
    borderColor: COLORS.border,
    borderWidth: 1.5,
  },
  expiredTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  expiredSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  infoCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.lg,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoCardIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  infoCardBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  cadenceHint: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginTop: 6,
  },
  historyList: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 8,
  },
  actionBtn: {
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addGoalBtn: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 12,
  },
  addGoalBtnIcon: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginRight: 6,
  },
  addGoalBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  achievedBtn: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  achievedBtnIcon: {
    color: '#059669',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 4,
  },
  dismissBtn: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
  },
  dismissBtnIcon: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '800',
    marginRight: 4,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADII.sm,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
