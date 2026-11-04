import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { LungsLoader } from '../../../components/ui';
import { useHomeDashboard } from '../hooks';
import { useActiveActivities, useActivities } from '../../activities/hooks';
import {
  getTimeGreeting,
  getNextDashboardQuote,
  MICROCOPY,
} from '../../../constants/microcopy';

export default function HomeScreen({ user }) {
  const navigation = useNavigation();
  const { t, openLanguageModal } = useLanguage();

  const {
    data: dashboardData,
    refetch: refetchDashboard,
    isLoading: isDashboardLoading,
  } = useHomeDashboard(user);

  const {
    data: activeList,
    refetch: refetchActive,
    isLoading: isActiveLoading,
  } = useActiveActivities();

  const {
    data: allActivities,
    refetch: refetchActivities,
  } = useActivities();

  // Dynamic motivational quote stored in screen state: rotates on manual pull-to-refresh
  const [dashboardQuote, setDashboardQuote] = useState(() =>
    getNextDashboardQuote() || "Ready to make today's planet-saving moves?"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Focus effect: whenever returning to Home/Dashboard, silently re-fetch live data
  useFocusEffect(
    useCallback(() => {
      refetchDashboard();
      refetchActive();
      refetchActivities();
    }, [refetchDashboard, refetchActive, refetchActivities])
  );

  // Pull-to-refresh handler: prevents duplicate calls and updates motivational quote
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchDashboard(),
        refetchActive(),
        refetchActivities(),
      ]);
      // Rotate quote dynamically upon manual refresh without repetition
      setDashboardQuote((prev) => getNextDashboardQuote(prev));
    } catch (err) {
      console.warn('Dashboard pull-to-refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetchDashboard, refetchActive, refetchActivities]);

  const currentUser = dashboardData?.user || user;
  const rawName = currentUser?.fullName || currentUser?.name || 'Citizen';
  const firstName = rawName.split(' ')[0] || 'Legend';
  const initial = (firstName.trim()[0] || 'L').toUpperCase();

  // Actual Dynamic User Metrics
  // 1. EcoScore: User's current EcoScore balance
  const ecoScoreVal = typeof currentUser?.ecoScore === 'number'
    ? currentUser.ecoScore
    : (currentUser?.ecoScore?.total !== undefined ? currentUser.ecoScore.total : 0);

  // 2. GreenPoints: User's current GreenPoints balance
  const greenPointsVal = currentUser?.totalPoints ?? currentUser?.points ?? currentUser?.greenPoints ?? 0;

  // 3. Active Quests: Strictly count currently active activity cycles
  const activeCount = useMemo(() => {
    if (!Array.isArray(activeList)) return 0;
    return activeList.filter((c) => {
      const s = c.cycle?.status || c.status;
      return s === 'active' || (!s && (c.cycle || c.activityId));
    }).length;
  }, [activeList]);

  // 4. CO2 Avoided: Total validated/recorded cumulative CO2e avoided
  const actualCO2Kg = currentUser?.totalCarbonSavedKg ?? currentUser?.carbonSavedKgCO2e ?? 0;
  const formattedCO2 = actualCO2Kg >= 1000
    ? `${(actualCO2Kg / 1000).toFixed(1)} t`
    : actualCO2Kg > 0
    ? `${Math.round(actualCO2Kg * 10) / 10} kg`
    : '0 kg';

  // Synchronized active missions for Today's Missions
  const activeMissions = useMemo(() => {
    if (!Array.isArray(activeList)) return [];
    return activeList
      .filter((item) => {
        const s = item.cycle?.status || item.status;
        return s === 'active' || (!s && (item.cycle || item.activityId));
      })
      .map((item) => {
        const act = item.activity || item.activityId || {};
        const cyc = item.cycle || item;
        const actId =
          item.activity?.activityId ||
          (typeof cyc?.activityId === 'string'
            ? cyc.activityId
            : typeof item.activityId === 'string'
            ? item.activityId
            : item.activityId?.activityId ||
              item.activityId?.id ||
              cyc?.activityId?.activityId ||
              item.activityCode ||
              cyc?.activityCode);
        const title = item.activity?.title || item.title || act.title || 'Sustainable Action';
        const category = item.activity?.category || act.category || 'energy';
        const isChecked = Boolean(item.todayCheckedIn || cyc.hasCheckedInToday || item.hasCheckedInToday);
        const currentDay = (cyc.currentDayIndex ?? 0) + 1;
        const totalDays = item.activity?.durationDays || act.durationDays || cyc.totalDurationDays || 7;
        const dayAction = cyc.todayPlanAction || '';
        return {
          id: actId || cyc._id || Math.random().toString(),
          actId,
          title,
          category,
          isChecked,
          currentDay,
          totalDays,
          dayAction,
          cycleId: cyc._id,
        };
      });
  }, [activeList]);

  // Count check-ins completed today across active challenges
  const todayCheckInsCount = useMemo(() => {
    return activeMissions.filter((m) => m.isChecked).length;
  }, [activeMissions]);

  // Dynamically select a featured daily side quest (from available un-enrolled activities)
  const featuredSideQuest = useMemo(() => {
    if (!Array.isArray(allActivities) || allActivities.length === 0) {
      return {
        activityId: 'energy_replace_led',
        title: 'Switch to LED Lighting 💡',
        category: 'energy',
        description: 'Small changes. Big impact. Upgrade bulbs for instant energy savings.',
        ecoScoreReward: 5,
        greenPointsReward: 30,
      };
    }
    const candidate = allActivities.find(
      (a) => a.userStatus !== 'active' && a.userStatus !== 'completed'
    );
    return candidate || allActivities[0];
  }, [allActivities]);

  // Session-stable Gen-Z greeting
  const greeting = useMemo(() => getTimeGreeting(), []);

  const handleOpenProfile = () => {
    navigation.navigate('Profile');
  };

  const handleOpenActivities = () => {
    navigation.navigate('Activities', { screen: 'ActivityCategories' });
  };

  const handleOpenActiveQuests = () => {
    navigation.navigate('Activities', { screen: 'ActiveActivities' });
  };

  const handleOpenFeaturedQuest = () => {
    const key = featuredSideQuest.activityId || featuredSideQuest.id;
    navigation.navigate('Activities', {
      screen: 'ActivityDetail',
      params: { key },
    });
  };

  // Full screen loading indicator on initial boot before any cache exists
  if (isDashboardLoading && !dashboardData && isActiveLoading && !activeList) {
    return (
      <View style={styles.fullScreenLoader}>
        <LungsLoader label="Loading your planet dashboard..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981', '#064E3B']}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        {/* Top App Header: Avatar + Mini greeting + Action Pill */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.profileBtn}
            activeOpacity={0.8}
            onPress={handleOpenProfile}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View>
              <Text style={styles.nameHeader}>{firstName}</Text>
              <Text style={styles.badgeLabel}>Mission LiFE Citizen</Text>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.actionCircle}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Leaderboard')}
              accessibilityLabel="Leaderboard"
            >
              <Text style={styles.actionIcon}>🏆</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCircle}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Notifications')}
              accessibilityLabel="Notifications"
            >
              <Text style={styles.actionIcon}>🔔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCircle}
              activeOpacity={0.8}
              onPress={openLanguageModal}
              accessibilityLabel="Language selection"
            >
              <Text style={styles.actionIcon}>🌐</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. GREETING SECTION (Directly on light background) */}
        <View style={styles.greetingSection}>
          <View style={styles.heroTagRow}>
            <View style={styles.eraPill}>
              <Text style={styles.eraPillText}>YOUR GREEN ERA 🌱</Text>
            </View>
          </View>

          <Text style={styles.heroGreeting}>"{greeting}"</Text>
          <Text style={styles.heroSub}>{dashboardQuote}</Text>
        </View>

        {/* 2. FOUR SEPARATE STATISTIC CARDS (2×2 Grid directly on light background) */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid2x2}>
            {/* TOP ROW: EcoScore (Bright Lime) & GreenPoints (Dark Charcoal/Green) */}
            <View style={styles.statsRow}>
              {/* EcoScore Tile */}
              <View style={[styles.statTile, styles.ecoScoreTile]}>
                <View style={styles.tileHeader}>
                  <View style={styles.limeIconBubble}>
                    <Text style={styles.limeIcon}>⚡</Text>
                  </View>
                  <Text style={styles.ecoScoreLabel}>ECOSCORE</Text>
                </View>
                <View style={styles.tileValueRow}>
                  <Text style={styles.ecoScoreVal}>{ecoScoreVal}</Text>
                  <Text style={styles.ecoScoreMax}>/100</Text>
                </View>
                <Text style={styles.ecoScoreSub}>Planet rating</Text>
              </View>

              {/* GreenPoints Tile */}
              <View style={[styles.statTile, styles.darkTile]}>
                <View style={styles.tileHeader}>
                  <View style={styles.darkIconBubble}>
                    <Text style={styles.darkIcon}>🌿</Text>
                  </View>
                  <Text style={styles.darkTileLabel}>GREENPOINTS</Text>
                </View>
                <View style={styles.tileValueRow}>
                  <Text style={styles.darkTileVal}>{greenPointsVal}</Text>
                  <Text style={styles.darkTileUnit}>pts</Text>
                </View>
                <Text style={styles.darkTileSub}>Reward balance</Text>
              </View>
            </View>

            {/* BOTTOM ROW: Active Quests (Dark Charcoal/Green) & CO2 Avoided (Warm Yellow/Mint) */}
            <View style={styles.statsRow}>
              {/* Active Quests Tile */}
              <TouchableOpacity
                style={[styles.statTile, styles.darkTile]}
                activeOpacity={0.8}
                onPress={handleOpenActiveQuests}
              >
                <View style={styles.tileHeader}>
                  <View style={styles.darkIconBubble}>
                    <Text style={styles.darkIcon}>🎯</Text>
                  </View>
                  <Text style={styles.darkTileLabel}>ACTIVE QUESTS</Text>
                </View>
                <View style={styles.tileValueRow}>
                  <Text style={styles.darkTileVal}>{activeCount}</Text>
                  <Text style={styles.darkTileUnit}>active</Text>
                </View>
                <Text style={styles.darkTileSub}>In progress ➔</Text>
              </TouchableOpacity>

              {/* CO2 Avoided Tile */}
              <View style={[styles.statTile, styles.co2Tile]}>
                <View style={styles.tileHeader}>
                  <View style={styles.warmIconBubble}>
                    <Text style={styles.warmIcon}>🌱</Text>
                  </View>
                  <Text style={styles.co2Label}>CO₂ AVOIDED</Text>
                </View>
                <View style={styles.tileValueRow}>
                  <Text style={styles.co2Val}>{formattedCO2}</Text>
                </View>
                <Text style={styles.co2Sub}>Verified saved</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. TODAY'S MISSIONS CHECK-IN SUMMARY & LIVE LIST */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {MICROCOPY.terminology.dailyTasks}
            </Text>
            <TouchableOpacity onPress={handleOpenActiveQuests} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>
                {MICROCOPY.terminology.viewProgress} ➔
              </Text>
            </TouchableOpacity>
          </View>

          {activeMissions.length === 0 ? (
            <View style={styles.missionCard}>
              <View style={styles.missionLeft}>
                <View style={styles.missionDotEmpty} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.missionHeading}>No active quests today</Text>
                  <Text style={styles.missionSub}>
                    Start a side quest below to begin your green journey!
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.missionActionBtn}
                activeOpacity={0.8}
                onPress={handleOpenActivities}
              >
                <Text style={styles.missionActionText}>Explore ➔</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activeMissionsWrapper}>
              {activeMissions.slice(0, 3).map((mission) => (
                <TouchableOpacity
                  key={mission.id}
                  style={[
                    styles.missionItemCard,
                    mission.isChecked && styles.missionItemCardDone,
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('Activities', {
                      screen: 'ActivityDetail',
                      params: { key: mission.actId },
                    })
                  }
                >
                  <View style={styles.missionItemLeft}>
                    <View
                      style={[
                        styles.missionCategoryIconBubble,
                        mission.isChecked && styles.missionCategoryIconBubbleDone,
                      ]}
                    >
                      <Text style={styles.missionCategoryIcon}>
                        {mission.category === 'transport'
                          ? '🚲'
                          : mission.category === 'waste'
                          ? '♻️'
                          : mission.category === 'water'
                          ? '💧'
                          : '⚡'}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text
                        style={[
                          styles.missionItemTitle,
                          mission.isChecked && styles.missionItemTitleDone,
                        ]}
                        numberOfLines={1}
                      >
                        {mission.title}
                      </Text>
                      <Text style={styles.missionItemMeta}>
                        Day {mission.currentDay} of {mission.totalDays}
                        {mission.dayAction ? ` • ${mission.dayAction}` : ''}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.missionStatusBadge,
                      mission.isChecked
                        ? styles.missionStatusDone
                        : styles.missionStatusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.missionStatusText,
                        mission.isChecked
                          ? styles.missionStatusTextDone
                          : styles.missionStatusTextPending,
                      ]}
                    >
                      {mission.isChecked ? '✓ Done' : 'Check In ➔'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Summary Footer */}
              <View style={styles.missionsSummaryRow}>
                <Text style={styles.missionsSummaryText}>
                  {todayCheckInsCount} of {activeMissions.length} missions completed today
                </Text>
                {activeMissions.length > 3 ? (
                  <TouchableOpacity onPress={handleOpenActiveQuests} activeOpacity={0.7}>
                    <Text style={styles.missionsMoreLink}>
                      +{activeMissions.length - 3} more ➔
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        </View>

        {/* 3. FEATURED DAILY SIDE QUEST */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>TODAY'S SIDE QUEST</Text>
            <View style={styles.dailyBadge}>
              <Text style={styles.dailyBadgeText}>FEATURED</Text>
            </View>
          </View>

          <View style={styles.sideQuestCard}>
            <View style={styles.sideQuestHeader}>
              <View style={styles.sideQuestIconBubble}>
                <Text style={styles.sideQuestIcon}>
                  {featuredSideQuest.category === 'transport'
                    ? '🚲'
                    : featuredSideQuest.category === 'water'
                    ? '💧'
                    : featuredSideQuest.category === 'waste'
                    ? '♻️'
                    : '⚡'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sideQuestTitle} numberOfLines={1}>
                  {featuredSideQuest.title}
                </Text>
                <Text style={styles.sideQuestSub} numberOfLines={2}>
                  {featuredSideQuest.description || 'Small changes. Big impact.'}
                </Text>
              </View>
            </View>

            <View style={styles.sideQuestFooter}>
              <View style={styles.questRewardsRow}>
                <View style={styles.rewardChip}>
                  <Text style={styles.rewardChipText}>
                    ⚡ +{featuredSideQuest.ecoScoreReward || 5} EcoScore
                  </Text>
                </View>
                <View style={styles.rewardChip}>
                  <Text style={styles.rewardChipText}>
                    🪙 +{featuredSideQuest.greenPointsReward || 25} GP
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.getItBtn}
                activeOpacity={0.85}
                onPress={handleOpenFeaturedQuest}
              >
                <Text style={styles.getItBtnText}>
                  {MICROCOPY.terminology.startChallenge} ➔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. EXPLORE ALL CATEGORIES CTA */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.exploreAllBanner}
            activeOpacity={0.85}
            onPress={handleOpenActivities}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.exploreTitle}>
                Browse All 59 Missions & Quests 🌿
              </Text>
              <Text style={styles.exploreSub}>
                Energy • Transportation • Waste • Water Conservation
              </Text>
            </View>
            <Text style={styles.exploreArrow}>➔</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  fullScreenLoader: {
    flex: 1,
    backgroundColor: '#022C22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 110, // Ensure no overlap with floating glass navigation bar
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? 14 : 12,
    paddingBottom: 10,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#A7F3D0',
  },
  nameHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 17,
  },
  greetingSection: {
    paddingHorizontal: SPACING.md,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  statsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  heroTagRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  eraPill: {
    backgroundColor: '#DCFCE7', // Light green pill
    borderColor: '#86EFAC',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADII.full || 14,
  },
  eraPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D', // High-contrast green on light mint pill
    letterSpacing: 0.6,
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#064E3B', // Rich deep forest-green typography
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13.5,
    color: '#475569', // Clean slate/charcoal on light background
    lineHeight: 18,
    fontWeight: '500',
  },

  /* 2×2 Grid of 4 Distinct Metric Cards */
  statsGrid2x2: {
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statTile: {
    flex: 1,
    borderRadius: RADII.lg || 16,
    paddingVertical: 12,
    paddingHorizontal: 13,
    justifyContent: 'space-between',
    minHeight: 88,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tileValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 2,
  },

  /* 1. EcoScore Card: Bright Lime-Green Accent (Visual Hero) */
  ecoScoreTile: {
    backgroundColor: '#A3E635', // Radiant vibrant lime
    borderWidth: 1.5,
    borderColor: '#84CC16',
    shadowColor: '#84CC16',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  limeIconBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(5, 46, 22, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  limeIcon: {
    fontSize: 11,
  },
  ecoScoreLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#052E16', // Deep forest for ultra-clean readability
    letterSpacing: 0.5,
  },
  ecoScoreVal: {
    fontSize: 25,
    fontWeight: '900',
    color: '#052E16',
    letterSpacing: -0.5,
  },
  ecoScoreMax: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(5, 46, 22, 0.65)',
  },
  ecoScoreSub: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(5, 46, 22, 0.75)',
  },

  /* 2. & 3. Dark Charcoal/Forest Green Cards (GreenPoints & Active Quests) */
  darkTile: {
    backgroundColor: '#022C22', // Deep charcoal/forest green
    borderWidth: 1.2,
    borderColor: 'rgba(52, 211, 153, 0.28)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  darkIconBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkIcon: {
    fontSize: 11,
  },
  darkTileLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#A7F3D0', // Soft mint accent
    letterSpacing: 0.5,
  },
  darkTileVal: {
    fontSize: 25,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  darkTileUnit: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6EE7B7',
  },
  darkTileSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  /* 4. CO2 Avoided: Soft Warm Yellow/Mint Contrast Card */
  co2Tile: {
    backgroundColor: '#FEF9C3', // Soft warm yellow
    borderWidth: 1.5,
    borderColor: '#FDE047',
    shadowColor: '#CA8A04',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  warmIconBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(113, 63, 18, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warmIcon: {
    fontSize: 11,
  },
  co2Label: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#713F12', // Warm deep bronze
    letterSpacing: 0.5,
  },
  co2Val: {
    fontSize: 22,
    fontWeight: '900',
    color: '#713F12',
    letterSpacing: -0.3,
  },
  co2Sub: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(113, 63, 18, 0.75)',
  },

  /* Sections */
  sectionContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark || '#00695C',
  },

  /* Today's Missions: Empty & Live List */
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADII.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  missionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  missionDotEmpty: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#94A3B8',
    marginRight: 10,
  },
  missionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  missionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  missionActionBtn: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  missionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },

  /* Synchronized Live Active Missions List */
  activeMissionsWrapper: {
    gap: 8,
  },
  missionItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADII.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  missionItemCardDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  missionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  missionCategoryIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  missionCategoryIconBubbleDone: {
    backgroundColor: '#DCFCE7',
  },
  missionCategoryIcon: {
    fontSize: 16,
  },
  missionItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  missionItemTitleDone: {
    color: '#15803D',
  },
  missionItemMeta: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  missionStatusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADII.md,
  },
  missionStatusPending: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  missionStatusDone: {
    backgroundColor: '#DCFCE7',
  },
  missionStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  missionStatusTextPending: {
    color: '#065F46',
  },
  missionStatusTextDone: {
    color: '#15803D',
  },
  missionsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  missionsSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  missionsMoreLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },

  /* Side Quest */
  sideQuestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADII.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dailyBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.full || 12,
  },
  dailyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  sideQuestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sideQuestIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  sideQuestIcon: {
    fontSize: 22,
  },
  sideQuestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sideQuestSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  sideQuestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  questRewardsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rewardChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADII.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rewardChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  getItBtn: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.md,
  },
  getItBtnText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '800',
  },

  /* Explore All Banner */
  exploreAllBanner: {
    backgroundColor: '#042F2E',
    borderRadius: RADII.xl,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#0F766E',
  },
  exploreTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  exploreSub: {
    fontSize: 11.5,
    color: '#A7F3D0',
  },
  exploreArrow: {
    fontSize: 18,
    color: '#34D399',
    fontWeight: '800',
    marginLeft: 8,
  },
});
