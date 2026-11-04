import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TopBar, Skeleton, Card, LungsLoader } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage, tr } from '../../../i18n/LanguageContext';
import { useCategories, useActiveActivities, useActivities } from '../hooks';
import CategoryTile from '../components/CategoryTile';
import ActivityCard from '../components/ActivityCard';

export default function ActivityCategoriesScreen({ user }) {
  const navigation = useNavigation();
  const { t } = useLanguage();

  const {
    data: categories,
    isLoading: isCatsLoading,
    refetch: refetchCats,
    isRefetching: isCatsRefetching,
  } = useCategories();

  const {
    data: activeList,
    isLoading: isActiveLoading,
    refetch: refetchActive,
  } = useActiveActivities();

  // Load recommendations (or sample activities from all categories)
  const {
    data: allActivities,
    isLoading: isRecsLoading,
    refetch: refetchRecs,
  } = useActivities();

  const activeCount = activeList?.length || 0;

  const onRefresh = () => {
    refetchCats();
    refetchActive();
    refetchRecs();
  };

  const handleSelectCategory = (cat) => {
    const titleKey = `cat_${cat.id}_name`;
    const title = t(titleKey) !== titleKey ? t(titleKey) : cat.name || cat.id;
    navigation.navigate('ActivityList', { category: cat.id, categoryTitle: title });
  };

  const handleSelectActivity = (item) => {
    const key = item.activityId || item.id;
    navigation.navigate('ActivityDetail', { key });
  };

  // Filter recommended activities (not currently active, limit to 2)
  const recommendedActivities = (allActivities || [])
    .filter((a) => a.userStatus !== 'active' && a.userStatus !== 'completed')
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <TopBar title={t('tab_activities')} user={user} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isCatsRefetching}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header Heading & Description */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>{t('activities_main_title')}</Text>
          <Text style={styles.mainSubtitle}>{t('activities_main_sub')}</Text>
        </View>

        {/* Active Challenges Summary Card */}
        <Card style={styles.activeSummaryCard} elevation="subtle">
          <View style={styles.activeSummaryContent}>
            <View style={styles.activeSummaryLeft}>
              <View style={styles.activeIndicatorRow}>
                <View
                  style={[
                    styles.statusIndicatorDot,
                    { backgroundColor: activeCount > 0 ? '#16A34A' : '#9CA3AF' },
                  ]}
                />
                <Text style={styles.activeBadgeText}>
                  {t('activities_active_badge')}
                </Text>
              </View>
              <Text style={styles.activeSummaryHeading}>
                {activeCount === 0
                  ? t('activities_active_summary_zero')
                  : activeCount === 1
                  ? t('activities_active_summary_one')
                  : t('activities_active_summary_many', { count: activeCount })}
              </Text>
            </View>

            {activeCount > 0 ? (
              <TouchableOpacity
                style={styles.viewActiveButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ActiveActivities')}
              >
                <Text style={styles.viewActiveButtonText}>
                  {t('activities_view_all_active', { count: activeCount })}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Card>

        {/* Category Cards Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('activities_categories_heading')}
          </Text>
        </View>

        {isCatsLoading ? (
          <LungsLoader label={tr('Loading planet-saving categories...')} size={90} />
        ) : (
          categories?.map((cat) => (
            <CategoryTile
              key={cat.id}
              category={cat}
              onPress={() => handleSelectCategory(cat)}
            />
          ))
        )}

        {/* Recommended Activities Section */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
          <Text style={styles.sectionTitle}>
            {t('activities_recommended_title')}
          </Text>
        </View>

        {isRecsLoading ? (
          <View style={styles.loadingContainer}>
            <Skeleton height={110} style={styles.skeleton} />
            <Skeleton height={110} style={styles.skeleton} />
          </View>
        ) : (
          recommendedActivities.map((act) => (
            <ActivityCard
              key={act.activityId || act.id}
              activity={act}
              onPress={() => handleSelectActivity(act)}
            />
          ))
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
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  activeSummaryCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: COLORS.primaryLight,
    borderWidth: 1.5,
  },
  activeSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeSummaryLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  activeIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeSummaryHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewActiveButton: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.sm,
  },
  viewActiveButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    paddingHorizontal: SPACING.md,
  },
  skeleton: {
    marginBottom: SPACING.sm,
    borderRadius: RADII.lg,
  },
});
