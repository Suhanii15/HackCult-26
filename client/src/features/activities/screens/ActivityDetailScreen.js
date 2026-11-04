import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, ProgressBar, Toast, Skeleton, Button } from '../../../components/ui';
import ActivityHeroIllustration from '../components/ActivityHeroIllustration';
import ActivityAssessmentModal from '../components/assessment/ActivityAssessmentModal';
import { COLORS, RADII, SPACING, SHADOWS } from '../../../theme';
import { useLanguage, tr } from '../../../i18n/LanguageContext';
import {
  getCheckInSuccessMessage,
  getChallengeCompletionMessage,
  getDuplicateEnrollmentMessage,
  MICROCOPY,
} from '../../../constants/microcopy';
import {
  useActivityDetail,
  useStartActivity,
  useAlreadyAchieved,
  useDismissActivity,
  useDailyCheckIn,
  useToggleLike,
} from '../hooks';
import { FALLBACK_ACTIVITIES } from '../api';

/**
 * Activity-specific engaging Gen-Z / motivational taglines
 */
function getActivitySubtitle(activity) {
  const id = (activity?.activityId || activity?.id || '').toLowerCase();
  if (id.includes('ac')) return 'Stay cool, use less energy, and give your carbon footprint a break 🌱';
  if (id.includes('led') || id.includes('bulb')) return 'Swap old filament for high-efficiency glow and save daily 💡';
  if (id.includes('switch_off') || id.includes('standby')) return 'Cut vampire standby drain and shrink your electric bill ⚡';
  if (id.includes('cycle') || id.includes('bike')) return 'Pedal over petrol. Good for fitness, great for clean air 🚲';
  if (id.includes('public_transport') || id.includes('bus') || id.includes('metro')) return 'Shared rides mean lighter traffic and massive emission cuts 🚆';
  if (id.includes('carpool')) return 'Fill the seats, split the fuel, and halve your commute emissions 🚗';
  if (id.includes('compost')) return 'Turn kitchen scraps into rich soil instead of landfill methane ♻️';
  if (id.includes('food_waste')) return 'Save good food from the bin and humble your food footprint 🍲';
  if (id.includes('plastic') || id.includes('bag')) return 'Say no to single-use plastic. Bring your own bag and bottle 🛍️';
  if (id.includes('water') || id.includes('tap') || id.includes('leak')) return 'Every drop conserved keeps reservoirs full and pumping clean 💧';
  if (id.includes('geyser') || id.includes('heater')) return 'Shorter warm showers mean big electricity and hot water savings 🚿';
  if (id.includes('tree') || id.includes('plant')) return 'Plant green, breathe clean, and leave a living legacy 🌳';
  return activity?.desc || activity?.description || 'Small everyday action, measurable planet-saving impact 🌱';
}

export default function ActivityDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();

  const rawKey =
    route.params?.key ||
    route.params?.activityId ||
    route.params?.id ||
    route.params?.activityCode ||
    route.params?.activity?.activityId ||
    route.params?.activity?.id ||
    route.params?.cycle?.activityId ||
    'energy_switch_off_unused';

  const activityKey =
    typeof rawKey === 'string'
      ? rawKey
      : (rawKey?.activityId || rawKey?.id || 'energy_switch_off_unused');

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
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(false);

  const fallbackAct =
    FALLBACK_ACTIVITIES.find(
      (a) => a.activityId === activityKey || a.id === activityKey
    ) || FALLBACK_ACTIVITIES[0];

  const activity = detailData?.activity || detailData || fallbackAct;
  const userCycle = detailData?.activeCycle || (activity?.userStatus === 'active' ? activity?.activeCycle : null);
  const status = detailData?.userStatus || activity?.userStatus || 'available';
  const hasCheckedInToday = Boolean(detailData?.todayCheckedIn || userCycle?.hasCheckedInToday);
  const checkInsHistory = detailData?.checkIns || [];

  const activityId = activity?.activityId || activity?.id || activityKey;
  const title = activity?.title || (activity?.titleKey && t(activity?.titleKey)) || 'Activity';
  const category = activity?.category || 'energy';
  const categoryName = activity?.category
    ? t(`cat_${activity.category}_name`) || activity.category.toUpperCase()
    : 'MISSION LiFE';

  const durationDays = activity?.durationDays || (activity?.activityType === 'one_time' ? 1 : 7);
  const isOneTime = activity?.activityType === 'one_time';
  const requiredCheckIns = userCycle?.requiredCheckIns || activity?.requiredCheckIns || (isOneTime ? 1 : 5);
  const ecoScore = activity?.ecoScoreReward || activity?.eco || 5;
  const greenPoints = activity?.greenPointsReward || activity?.gp || 20;
  const subtitle = getActivitySubtitle(activity);
  const effortMinutes = activity?.effortMinutes || activity?.estimatedMinutes || activity?.min || 5;
  const difficulty = (activity?.difficulty || activity?.diff || 'easy').toLowerCase();

  // Carbon Impact Data Extraction: normalize backend & fallback fields
  const impact = activity?.impact;
  const isQuantitative = activity?.isQuantitativeImpact ?? impact?.isQuantitative ?? true;
  const rawCarbonPerDay =
    activity?.carbonPerQuantityKgCO2e ??
    activity?.carbonSavingKgCO2e ??
    impact?.carbonPerQuantity ??
    0;
  const carbonPerDay = Math.round(rawCarbonPerDay * 100) / 100;
  const totalCycleSaved = Math.round(
    (activity?.totalCycleCarbonSavingKg ?? (isOneTime ? carbonPerDay : carbonPerDay * durationDays)) * 100
  ) / 100;
  const carbonCycleTotal = isOneTime ? carbonPerDay : totalCycleSaved;

  const assumptionsText =
    activity?.assumptions ||
    impact?.assume ||
    'Calculated using Central Electricity Authority (CEA v19) 0.71 kg CO₂e/kWh grid factor & ARAI emission baselines. Clearly stated as a conservative estimate.';
  const instructionsText = activity?.instructions || activity?.how || '';
  const criteriaText = activity?.completionCriteria || activity?.crit || '';
  const whyMattersText = activity?.whyItMatters || activity?.why || '';

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ActivityCategories');
    }
  };

  // Resource Savings Extraction
  let resourceText = null;
  if (category === 'energy') {
    if (activityId.includes('ac')) {
      resourceText = '~1.5 kWh electricity saved / day';
    } else if (activityId.includes('led')) {
      resourceText = '~0.11 kWh saved / bulb / day';
    } else if (activityId.includes('switch_off')) {
      resourceText = '~0.2 kWh standby power / night';
    } else {
      resourceText = 'Measurable electricity reduction';
    }
  } else if (category === 'transport') {
    resourceText = 'Avoids fossil fuel combustion emissions';
  } else if (category === 'water') {
    resourceText = '~20 - 40 Litres clean water saved';
  } else if (category === 'waste') {
    resourceText = 'Diverts organic waste from methane release';
  }

  // Action A: Add to my goals
  const handleAddToGoals = () => {
    if (!activity) return;
    if (status === 'active' || userCycle) {
      setToastMessage({
        type: 'info',
        msg: getDuplicateEnrollmentMessage(),
      });
      return;
    }
    if (status === 'completed') {
      setToastMessage({
        type: 'info',
        msg: 'You have already completed this activity today! You can restart tomorrow.',
      });
      return;
    }
    startMutation.mutate(activityId, {
      onSuccess: () => {
        setToastMessage({
          type: 'success',
          msg: 'Quest unlocked! Added to your active missions 🌱',
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

    if (!isOneTime) {
      setToastMessage({
        type: 'info',
        msg: 'Habits build through regular daily practice. Add this goal to start your 7-day streak!',
      });
      return;
    }

    setConfirmModalVisible(true);
  };

  const handleConfirmAlreadyAchieved = () => {
    setConfirmModalVisible(false);
    alreadyAchievedMutation.mutate(activityId, {
      onSuccess: (res) => {
        setToastMessage({
          type: 'success',
          msg: `Mission accomplished! +${res.pointsEarned || greenPoints} Green Points & +${res.ecoScoreAwarded || ecoScore} EcoScore! 🏆`,
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
    dismissMutation.mutate(activityId, {
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
          const isCompleted = res.justCompleted || res.cycle?.isCompleted;
          setToastMessage({
            type: 'success',
            msg: isCompleted
              ? getChallengeCompletionMessage()
              : getCheckInSuccessMessage(),
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
    toggleLikeMutation.mutate(activityId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#022C22" />

      {/* FLOATING TOP NAVIGATION BAR */}
      <SafeAreaView edges={['top']} style={styles.navBarWrapper}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.navButton}
            activeOpacity={0.7}
            accessibilityLabel={t('back') || 'Go Back'}
          >
            <Text style={styles.navButtonIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText} numberOfLines={1}>
              {category === 'energy' ? '⚡ ' : category === 'transport' ? '🚲 ' : category === 'waste' ? '♻️ ' : '💧 '}
              {categoryName}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleToggleLike}
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <Text style={styles.navHeartIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* TOAST MESSAGE */}
      {toastMessage ? (
        <View style={styles.toastContainer}>
          <Toast
            message={toastMessage.msg}
            type={toastMessage.type}
            onDismiss={() => setToastMessage(null)}
          />
        </View>
      ) : null}

      {/* FULL-PAGE SCROLLABLE BODY */}
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
        {isLoading && !activity ? (
          <View style={styles.loadingContainer}>
            <Skeleton height={240} style={styles.skeleton} />
            <Skeleton height={120} style={styles.skeleton} />
            <Skeleton height={140} style={styles.skeleton} />
          </View>
        ) : (
          <View>
            {/* ══════════════════════════════════════════════════════════ */}
            {/* PART 2 & 3: NEW IMMERSIVE HERO SECTION                    */}
            {/* ══════════════════════════════════════════════════════════ */}
            <View style={styles.heroSection}>
              {/* Bespoke SVG Illustration */}
              <ActivityHeroIllustration
                activityId={activityId}
                category={category}
                height={230}
              />

              {/* Hero Title & Subtitle Card */}
              <View style={styles.heroContent}>
                <View style={styles.heroTagRow}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {isOneTime ? '⚡ ONE-TIME MISSION' : '🔄 7-DAY CHALLENGE'}
                    </Text>
                  </View>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyBadgeText}>
                      {difficulty === 'easy' ? '🟢 Easy' : difficulty === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                    </Text>
                  </View>
                </View>

                {/* Bold Activity Title */}
                <Text style={styles.heroTitle}>{title}</Text>

                {/* Engaging Gen-Z Tagline */}
                <Text style={styles.heroSubtitle}>{subtitle}</Text>

                {/* Compact Metadata Row */}
                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaIcon}>⏱</Text>
                    <Text style={styles.metaText}>{effortMinutes} min/day</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaPill}>
                    <Text style={styles.metaIcon}>🎯</Text>
                    <Text style={styles.metaText}>
                      {isOneTime ? '1 verified action' : `${requiredCheckIns}/${durationDays} check-ins`}
                    </Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaPill}>
                    <Text style={styles.metaIcon}>🏆</Text>
                    <Text style={styles.metaText}>+{greenPoints} pts</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ══════════════════════════════════════════════════════════ */}
            {/* ACTIVE QUEST STATUS (IF CURRENTLY ENROLLED)               */}
            {/* ══════════════════════════════════════════════════════════ */}
            {status === 'active' && userCycle ? (
              <View style={styles.sectionContainer}>
                {/* Personalized Plan Tracker (if personalized) */}
                {userCycle.isPersonalized ? (
                  <Card style={styles.personalizedPlanCard} elevation="subtle">
                    <View style={styles.planHeaderRow}>
                      <Text style={styles.planBadgeText}>{tr('✨ YOUR PERSONALIZED ROADMAP')}</Text>
                      {userCycle.recommendedReduction?.percentage ? (
                        <View style={styles.reductionTag}>
                          <Text style={styles.reductionTagText}>
                            -{userCycle.recommendedReduction.percentage}% Target
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Today's Action Step */}
                    {userCycle.todayPlanAction ? (
                      <View style={styles.todayActionBox}>
                        <Text style={styles.todayActionLabel}>
                          📅 DAY {((userCycle.currentDayIndex || 0) + 1)} ACTION STEP:
                        </Text>
                        <Text style={styles.todayActionText}>{userCycle.todayPlanAction}</Text>
                      </View>
                    ) : null}

                    {/* Baseline vs Target */}
                    <View style={styles.habitCompareRow}>
                      <View style={styles.habitCol}>
                        <Text style={styles.habitLabel}>{tr('BASELINE')}</Text>
                        <Text style={styles.habitVal}>
                          {(typeof userCycle.currentUsage === 'string' && userCycle.currentUsage.trim().length > 0)
                            ? userCycle.currentUsage
                            : userCycle.currentUsage?.formatted ||
                              (userCycle.currentUsage?.value !== undefined
                                ? `${userCycle.currentUsage.value} ${userCycle.currentUsage.unit || ''}`.trim()
                                : 'Current habit')}
                        </Text>
                      </View>
                      <Text style={styles.habitArrow}>➔</Text>
                      <View style={styles.habitCol}>
                        <Text style={[styles.habitLabel, { color: COLORS.primaryDark }]}>{tr('RECOMMENDED TARGET')}</Text>
                        <Text style={[styles.habitVal, { color: COLORS.primaryDark }]}>
                          {(typeof userCycle.recommendedTarget === 'string' && userCycle.recommendedTarget.trim().length > 0)
                            ? userCycle.recommendedTarget
                            : userCycle.recommendedTarget?.formatted ||
                              (userCycle.recommendedTarget?.value !== undefined
                                ? `${userCycle.recommendedTarget.value} ${userCycle.recommendedTarget.unit || ''}`.trim()
                                : 'Optimized habit')}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ) : null}

                {/* Active Check-In Progress Card */}
                <Card style={styles.activeQuestCard} elevation="subtle">
                  <View style={styles.activeHeaderRow}>
                    <View style={[styles.activeDot, hasCheckedInToday && { backgroundColor: '#15803D' }]} />
                    <Text style={styles.activeHeaderTitle}>
                      {hasCheckedInToday ? '✓ Check-in Recorded for Today' : '● Quest In Progress'}
                    </Text>
                    <Text style={styles.dayIndexText}>
                      Day {((userCycle.currentDayIndex || 0) + 1)} of {durationDays}
                    </Text>
                  </View>

                  {/* Progress Bar & Qualification Threshold */}
                  <View style={styles.progressBarWrapper}>
                    <ProgressBar
                      current={userCycle.successfulCheckIns || 0}
                      total={durationDays}
                      label={`${userCycle.successfulCheckIns || 0} of ${durationDays} check-ins completed`}
                      threshold={requiredCheckIns}
                      thresholdLabel={
                        (userCycle.successfulCheckIns || 0) >= requiredCheckIns
                          ? `🎉 Minimum reward threshold achieved (${userCycle.successfulCheckIns || 0}/${durationDays} days completed)! Keep it up to boost your streak.`
                          : `Complete at least ${requiredCheckIns} of ${durationDays} check-ins to qualify for rewards.`
                      }
                    />
                  </View>

                  {/* Daily Check-In Prompt */}
                  <View style={styles.checkInBox}>
                    {hasCheckedInToday ? (
                      <View style={styles.checkedTodayBox}>
                        <Text style={styles.checkedTodayText}>
                          {tr('✓ Today\'s check-in recorded! Next check-in unlocks tomorrow.')}
                        </Text>
                      </View>
                    ) : (
                      <View>
                        <Text style={styles.checkInQuestion}>
                          {tr('Did you complete today\'s mission?')}
                        </Text>
                        <View style={styles.checkInButtonsRow}>
                          <TouchableOpacity
                            style={[styles.checkInBtn, styles.checkInYesBtn]}
                            activeOpacity={0.8}
                            onPress={() => handleCheckIn(true)}
                            disabled={dailyCheckInMutation.isPending}
                          >
                            <Text style={styles.checkInYesText}>✓ {MICROCOPY.activities.buttons.complete}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.checkInBtn, styles.checkInNoBtn]}
                            activeOpacity={0.8}
                            onPress={() => handleCheckIn(false)}
                            disabled={dailyCheckInMutation.isPending}
                          >
                            <Text style={styles.checkInNoText}>{tr('× Not Today')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </Card>
              </View>
            ) : null}

            {/* Completed Banner (if finished) */}
            {status === 'completed' ? (
              <View style={styles.sectionContainer}>
                <Card style={styles.completedCard} elevation="subtle">
                  <Text style={styles.completedTitle}>{tr('🏆 Quest Conquered!')}</Text>
                  <Text style={styles.completedSub}>
                    You unlocked +{greenPoints} GreenPoints and +{ecoScore} EcoScore for this achievement.
                  </Text>
                  {activity.isRecurring ? (
                    <TouchableOpacity
                      style={styles.restartButton}
                      activeOpacity={0.8}
                      onPress={handleRestartChallenge}
                      disabled={startMutation.isPending}
                    >
                      <Text style={styles.restartButtonText}>{tr('🔄 Restart Quest (Day 0)')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.oneTimeDoneBadge}>{tr('✓ One-time action completed')}</Text>
                  )}
                </Card>
              </View>
            ) : null}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* PART 4: ENVIRONMENTAL IMPACT SECTION                      */}
            {/* ══════════════════════════════════════════════════════════ */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{tr('🌱 ENVIRONMENTAL IMPACT')}</Text>
                <View style={styles.estimatePill}>
                  <Text style={styles.estimatePillText}>
                    {userCycle ? 'ESTIMATED SAVINGS' : 'POTENTIAL IMPACT'}
                  </Text>
                </View>
              </View>

              <Card style={styles.impactCard} elevation="subtle">
                {/* 2-Column Impact Grid */}
                <View style={styles.impactGrid}>
                  {/* CO2e Saved */}
                  <View style={[styles.impactBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <Text style={styles.impactLabel}>{tr('CO₂e Avoided')}</Text>
                    <Text style={[styles.impactVal, { color: '#047857' }]}>
                      {carbonPerDay > 0
                        ? `~${carbonPerDay} kg`
                        : 'Avoids CO₂e'}
                    </Text>
                    <Text style={styles.impactSub}>
                      {isOneTime
                        ? 'per completion'
                        : `per day (≈ ${carbonCycleTotal} kg / cycle)`}
                    </Text>
                  </View>

                  {/* Resource Saved */}
                  <View style={[styles.impactBox, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                    <Text style={styles.impactLabel}>{tr('Resource Saving')}</Text>
                    <Text style={[styles.impactVal, { color: '#0369A1' }]}>
                      {resourceText ? 'Optimized' : 'Measurable'}
                    </Text>
                    <Text style={styles.impactSub}>
                      {resourceText || 'Conserves critical grid & nature reserves'}
                    </Text>
                  </View>
                </View>

                {/* Rewards Strip */}
                <View style={styles.rewardsStrip}>
                  <View style={styles.rewardChip}>
                    <Text style={styles.rewardChipIcon}>⚡</Text>
                    <Text style={styles.rewardChipText}>+{ecoScore} EcoScore</Text>
                  </View>
                  <View style={styles.rewardChip}>
                    <Text style={styles.rewardChipIcon}>🌿</Text>
                    <Text style={styles.rewardChipText}>+{greenPoints} GreenPoints</Text>
                  </View>
                </View>

                {/* Defensible Methodology Note */}
                <View style={styles.methodologyBox}>
                  <Text style={styles.methodologyText}>
                    ℹ️ <Text style={{ fontWeight: '700' }}>{tr('Baseline Assumption:')}</Text>{' '}
                    {assumptionsText}
                  </Text>
                </View>
              </Card>
            </View>

            {/* ══════════════════════════════════════════════════════════ */}
            {/* PART 5: UNIFIED MISSION BRIEF & HOW IT WORKS               */}
            {/* (Replaces separate Why Matters and Instructions cards)     */}
            {/* ══════════════════════════════════════════════════════════ */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{tr('📋 MISSION BRIEF')}</Text>

              <Card style={styles.infoCard} elevation="subtle">
                <Text style={styles.briefDescription}>
                  {activity.desc || activity.description}
                </Text>

                {/* How to complete it */}
                {instructionsText ? (
                  <View style={styles.stepsBox}>
                    <Text style={styles.stepsTitle}>{tr('WHAT TO DO:')}</Text>
                    <Text style={styles.stepsText}>
                      {instructionsText}
                    </Text>
                  </View>
                ) : null}

                {/* Completion Criteria & Cadence */}
                <View style={styles.criteriaBox}>
                  <Text style={styles.criteriaTitle}>{tr('COMPLETION CRITERIA:')}</Text>
                  <Text style={styles.criteriaText}>
                    {criteriaText || (
                      isOneTime
                        ? 'Complete and confirm this action once to earn your rewards.'
                        : `Check in on at least ${requiredCheckIns} of ${durationDays} days to unlock full quest rewards.`
                    )}
                  </Text>
                </View>

                {/* Optional Expandable: Why This Matters Deep Dive */}
                {whyMattersText ? (
                  <View style={styles.expandableWrapper}>
                    <TouchableOpacity
                      style={styles.expandHeader}
                      onPress={() => setWhyExpanded(!whyExpanded)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.expandTitle}>
                        🌱 Why this matters for our planet {whyExpanded ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>

                    {whyExpanded && (
                      <View style={styles.expandContent}>
                        <Text style={styles.expandText}>
                          {whyMattersText}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : null}
              </Card>
            </View>

            {/* ══════════════════════════════════════════════════════════ */}
            {/* PART 6: REDESIGNED SCROLLABLE ACTION AREA                 */}
            {/* (Natural scrollable placement, NO sticky bottom bar)       */}
            {/* ══════════════════════════════════════════════════════════ */}
            <View style={styles.actionSectionWrapper}>
              {status === 'available' ? (
                <View style={styles.actionContainer}>
                  {/* Primary Action: + Add to My Goals */}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.primaryAddBtn]}
                    activeOpacity={0.85}
                    onPress={handleAddToGoals}
                    disabled={startMutation.isPending}
                  >
                    <Text style={styles.primaryAddBtnText}>
                      + {MICROCOPY.activities.buttons.start}
                    </Text>
                  </TouchableOpacity>

                  {/* Secondary Action: Personalize Your Plan */}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.secondaryPersonalizeBtn]}
                    activeOpacity={0.85}
                    onPress={() => setAssessmentModalVisible(true)}
                    disabled={startMutation.isPending}
                  >
                    <Text style={styles.secondaryPersonalizeBtnText}>
                      {MICROCOPY.activities.buttons.assessment}
                    </Text>
                  </TouchableOpacity>

                  {/* Other Actions: Already Achieved & Not for Me */}
                  <View style={styles.tertiaryRow}>
                    <TouchableOpacity
                      style={styles.tertiaryBtn}
                      activeOpacity={0.7}
                      onPress={handlePressAlreadyAchieved}
                      disabled={alreadyAchievedMutation.isPending}
                    >
                      <Text style={styles.tertiaryBtnText}>{tr('✓ Already Achieved')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.tertiarySeparator}>•</Text>

                    <TouchableOpacity
                      style={styles.tertiaryBtn}
                      activeOpacity={0.7}
                      onPress={handleDismiss}
                      disabled={dismissMutation.isPending}
                    >
                      <Text style={[styles.tertiaryBtnText, { color: '#94A3B8' }]}>
                        {tr('× Not for Me')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : status === 'active' ? (
                <View style={styles.activeStatusBar}>
                  <Text style={styles.activeStatusText}>
                    {hasCheckedInToday
                      ? `✓ ${MICROCOPY.activities.buttons.keepStreak}! Next check-in unlocks tomorrow.`
                      : '● Quest Active • Record your daily check-in above.'}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Check-ins History (if any) */}
            {checkInsHistory.length > 0 ? (
              <View style={[styles.sectionContainer, { marginTop: SPACING.md }]}>
                <Text style={styles.sectionTitle}>{tr('📅 CYCLE HISTORY')}</Text>
                <Card style={styles.infoCard} elevation="subtle">
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
              </View>
            ) : null}

            {/* Generous bottom spacing for smooth, un-obscured scrolling */}
            <View style={{ height: 80 }} />
          </View>
        )}
      </ScrollView>

      {/* CONFIRMATION MODAL for One-Time Action: Already Achieved */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{tr('Confirm Achievement')}</Text>
            <Text style={styles.modalBody}>
              Did you already complete this sustainability action? You'll earn +{greenPoints} GreenPoints and +{ecoScore} EcoScore upon confirmation.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setConfirmModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>{tr('Cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handleConfirmAlreadyAchieved}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmText}>Confirm & Claim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PERSONALIZED HABIT ASSESSMENT MODAL */}
      <ActivityAssessmentModal
        visible={assessmentModalVisible}
        onClose={() => setAssessmentModalVisible(false)}
        activity={activity}
        onEnrolled={() => {
          refetch();
          setToastMessage({
            type: 'success',
            msg: 'Personalized challenge started! Your custom targets and roadmap are active.',
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022C22', // Deep forest background matching hero
  },
  navBarWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(6, 78, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navHeartIcon: {
    fontSize: 18,
  },
  categoryPill: {
    backgroundColor: 'rgba(6, 78, 59, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.3)',
    maxWidth: '60%',
  },
  categoryPillText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toastContainer: {
    position: 'absolute',
    top: 95,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 30,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: SPACING.lg,
    paddingTop: 100,
  },
  skeleton: {
    marginBottom: SPACING.md,
    borderRadius: RADII.lg,
  },

  /* Hero Section */
  heroSection: {
    backgroundColor: '#064E3B',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 60, // Space for top nav bar
    paddingBottom: SPACING.xl,
    overflow: 'hidden',
  },
  heroContent: {
    paddingHorizontal: SPACING.xl,
    marginTop: -20, // Gentle overlap with illustration base
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#047857',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 33,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#A7F3D0',
    fontWeight: '500',
    marginBottom: SPACING.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 44, 34, 0.55)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.2)',
  },
  metaPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  /* Section Containers */
  sectionContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  estimatePill: {
    backgroundColor: 'rgba(6, 78, 59, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.2)',
  },
  estimatePillText: {
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: '700',
  },

  /* Impact Section */
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADII.xl,
    padding: SPACING.md,
  },
  impactGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  impactBox: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADII.md,
    borderWidth: 1,
  },
  impactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  impactVal: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  impactSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 14,
  },
  rewardsStrip: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  rewardChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  rewardChipIcon: {
    fontSize: 14,
  },
  rewardChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  methodologyBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: RADII.sm,
    padding: 8,
  },
  methodologyText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },

  /* Mission Brief Card */
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADII.xl,
    padding: SPACING.lg,
  },
  briefDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#334155',
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  stepsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  stepsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  stepsText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#1E293B',
    fontWeight: '500',
  },
  criteriaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
  },
  criteriaTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  criteriaText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#1E293B',
    fontWeight: '500',
  },
  expandableWrapper: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: SPACING.sm,
  },
  expandHeader: {
    paddingVertical: 6,
  },
  expandTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  expandContent: {
    marginTop: 6,
    backgroundColor: '#F0FDF4',
    padding: SPACING.sm,
    borderRadius: RADII.sm,
  },
  expandText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#166534',
  },

  /* Action Area (Scrollable natural flow) */
  actionSectionWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  actionContainer: {
    gap: 10,
  },
  primaryAddBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryAddBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryPersonalizeBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    paddingVertical: 13,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryPersonalizeBtnText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '700',
  },
  tertiaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  tertiaryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tertiaryBtnText: {
    color: '#A7F3D0',
    fontSize: 13,
    fontWeight: '600',
  },
  tertiarySeparator: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 14,
  },
  activeStatusBar: {
    backgroundColor: '#064E3B',
    borderRadius: RADII.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#059669',
    alignItems: 'center',
  },
  activeStatusText: {
    color: '#A7F3D0',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* Active Quest Details & Progress */
  activeQuestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADII.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  activeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    marginRight: 8,
  },
  activeHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  dayIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  progressBarWrapper: {
    marginBottom: SPACING.md,
  },
  checkInBox: {
    marginTop: SPACING.xs,
  },
  checkInQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  checkInButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  checkInBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInYesBtn: {
    backgroundColor: '#16A34A',
  },
  checkInYesText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  checkInNoBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  checkInNoText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 14,
  },
  checkedTodayBox: {
    backgroundColor: '#F0FDF4',
    padding: SPACING.sm,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  checkedTodayText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },

  /* Personalized Plan Card */
  personalizedPlanCard: {
    padding: SPACING.md,
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderWidth: 1.5,
    borderRadius: RADII.xl,
    marginBottom: SPACING.sm,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  reductionTag: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.full,
  },
  reductionTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  todayActionBox: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: RADII.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#0D9488',
  },
  todayActionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D9488',
    marginBottom: 2,
  },
  todayActionText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#134E4A',
    fontWeight: '600',
  },
  habitCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: RADII.md,
  },
  habitCol: {
    flex: 1,
  },
  habitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  habitVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  habitArrow: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 8,
  },

  /* Completed & Expired */
  completedCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
    borderRadius: RADII.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#047857',
    marginBottom: 6,
  },
  completedSub: {
    fontSize: 13,
    lineHeight: 18,
    color: '#065F46',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  restartButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADII.md,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  oneTimeDoneBadge: {
    color: '#047857',
    fontWeight: '700',
    fontSize: 12,
  },

  /* History */
  historyList: {
    gap: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyDate: {
    fontSize: 12,
    color: '#64748B',
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADII.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 380,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    marginBottom: SPACING.lg,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 13,
  },
  modalConfirmBtn: {
    backgroundColor: '#059669',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
