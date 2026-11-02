import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Skeleton, EmptyState } from '../../../components/ui';
import { COLORS, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useActivities } from '../hooks';
import ActivityCard from '../components/ActivityCard';

export default function ActivityListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();

  const category = route.params?.category || 'energy';
  const categoryTitle = route.params?.categoryTitle || t('tab_activities');

  const { data: activities, isLoading, refetch, isRefetching } = useActivities(category);

  const handleSelectActivity = (item) => {
    const key = item.activityId || item.id;
    navigation.navigate('ActivityDetail', { key });
  };

  return (
    <View style={styles.container}>
      {/* Sub-Stack Header */}
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
          {categoryTitle}
        </Text>
        <View style={styles.placeholder} />
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
          <View style={styles.loadingContainer}>
            <Skeleton height={130} style={styles.skeleton} />
            <Skeleton height={130} style={styles.skeleton} />
            <Skeleton height={130} style={styles.skeleton} />
          </View>
        ) : activities && activities.length > 0 ? (
          activities.map((item) => (
            <ActivityCard
              key={item.activityId || item.id}
              activity={item}
              onPress={() => handleSelectActivity(item)}
            />
          ))
        ) : (
          <EmptyState
            title="No actions found"
            message="No activities available in this category currently."
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
    paddingBottom: 32,
  },
  loadingContainer: {
    paddingHorizontal: SPACING.md,
  },
  skeleton: {
    marginBottom: SPACING.md,
  },
});
