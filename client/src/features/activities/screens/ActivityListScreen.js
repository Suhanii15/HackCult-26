import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Skeleton, EmptyState, LungsLoader } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useActivities } from '../hooks';
import ActivityCard from '../components/ActivityCard';
import {
  applyDiscovery,
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  CARBON_BANDS,
  ECO_OPTIONS,
  POINTS_OPTIONS,
  activeFilterCount,
} from '../utils/discovery';

export default function ActivityListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();

  const category = route.params?.category || 'energy';
  const categoryTitle = route.params?.categoryTitle || t('tab_activities');

  const { data: rawActivities, isLoading, refetch, isRefetching } = useActivities(category);

  // Discovery State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Apply search, filters, and sort
  const discoveredActivities = useMemo(() => {
    if (!rawActivities || !Array.isArray(rawActivities)) return [];
    return applyDiscovery(rawActivities, {
      query: searchQuery,
      filters,
      sort: selectedSort,
    });
  }, [rawActivities, searchQuery, filters, selectedSort]);

  const activeFilters = activeFilterCount(filters);

  const handleSelectActivity = (item) => {
    const key = item.activityId || item.id;
    navigation.navigate('ActivityDetail', { key });
  };

  const handleResetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setSearchQuery('');
    setSelectedSort('recommended');
  };

  const toggleDifficulty = (diff) => {
    setFilters((prev) => {
      const exists = prev.difficulties.includes(diff);
      return {
        ...prev,
        difficulties: exists
          ? prev.difficulties.filter((d) => d !== diff)
          : [...prev.difficulties, diff],
      };
    });
  };

  const toggleDuration = (dur) => {
    setFilters((prev) => {
      const exists = prev.durations.includes(dur);
      return {
        ...prev,
        durations: exists
          ? prev.durations.filter((d) => d !== dur)
          : [...prev.durations, dur],
      };
    });
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

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by action, appliance, habit..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.clearSearchBtn}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Discovery Controls Bar: Filter & Sort */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={[styles.controlPill, activeFilters > 0 && styles.controlPillActive]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.controlPillText, activeFilters > 0 && styles.controlPillTextActive]}>
            ⚙️ Filters {activeFilters > 0 ? `(${activeFilters})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlPill}
          onPress={() => setSortModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.controlPillText}>
            ↕️ {SORT_OPTIONS.find((s) => s.key === selectedSort)?.label || 'Sort'}
          </Text>
        </TouchableOpacity>

        {(activeFilters > 0 || searchQuery.length > 0) ? (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetFilters}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ flex: 1 }} />
        <Text style={styles.countText}>
          {discoveredActivities.length} {discoveredActivities.length === 1 ? 'action' : 'actions'}
        </Text>
      </View>

      {/* Activities ScrollView */}
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
        ) : discoveredActivities && discoveredActivities.length > 0 ? (
          discoveredActivities.map((item) => (
            <ActivityCard
              key={item.activityId || item.id}
              activity={item}
              onPress={() => handleSelectActivity(item)}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="No matching activities"
              message="Try adjusting your search terms or clearing your active filters."
            />
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={handleResetFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyResetText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Activities</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Difficulty Filter */}
              <Text style={styles.filterSectionTitle}>Difficulty</Text>
              <View style={styles.filterChipRow}>
                {['easy', 'medium', 'hard'].map((diff) => {
                  const sel = filters.difficulties.includes(diff);
                  return (
                    <TouchableOpacity
                      key={diff}
                      style={[styles.filterChip, sel && styles.filterChipSelected]}
                      onPress={() => toggleDifficulty(diff)}
                    >
                      <Text style={[styles.filterChipText, sel && styles.filterChipTextSelected]}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Duration Filter */}
              <Text style={styles.filterSectionTitle}>Time Commitment</Text>
              <View style={styles.filterChipRow}>
                {[
                  { key: 'short', label: 'Short (≤ 10 min)' },
                  { key: 'medium', label: 'Medium (10-30 min)' },
                  { key: 'long', label: 'Long (> 30 min)' },
                ].map((dur) => {
                  const sel = filters.durations.includes(dur.key);
                  return (
                    <TouchableOpacity
                      key={dur.key}
                      style={[styles.filterChip, sel && styles.filterChipSelected]}
                      onPress={() => toggleDuration(dur.key)}
                    >
                      <Text style={[styles.filterChipText, sel && styles.filterChipTextSelected]}>
                        {dur.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Carbon Savings Filter */}
              <Text style={styles.filterSectionTitle}>Carbon Savings</Text>
              <View style={styles.filterChipRow}>
                {CARBON_BANDS.map((cb) => {
                  const sel = filters.carbon === cb.key;
                  return (
                    <TouchableOpacity
                      key={cb.key}
                      style={[styles.filterChip, sel && styles.filterChipSelected]}
                      onPress={() => setFilters((p) => ({ ...p, carbon: cb.key }))}
                    >
                      <Text style={[styles.filterChipText, sel && styles.filterChipTextSelected]}>
                        {cb.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* EcoScore Filter */}
              <Text style={styles.filterSectionTitle}>Min EcoScore</Text>
              <View style={styles.filterChipRow}>
                {ECO_OPTIONS.map((eo) => {
                  const sel = filters.eco === eo.key;
                  return (
                    <TouchableOpacity
                      key={eo.key}
                      style={[styles.filterChip, sel && styles.filterChipSelected]}
                      onPress={() => setFilters((p) => ({ ...p, eco: eo.key }))}
                    >
                      <Text style={[styles.filterChipText, sel && styles.filterChipTextSelected]}>
                        ⚡ {eo.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* GreenPoints Filter */}
              <Text style={styles.filterSectionTitle}>Min GreenPoints</Text>
              <View style={styles.filterChipRow}>
                {POINTS_OPTIONS.map((po) => {
                  const sel = filters.points === po.key;
                  return (
                    <TouchableOpacity
                      key={po.key}
                      style={[styles.filterChip, sel && styles.filterChipSelected]}
                      onPress={() => setFilters((p) => ({ ...p, points: po.key }))}
                    >
                      <Text style={[styles.filterChipText, sel && styles.filterChipTextSelected]}>
                        🌿 {po.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={() => setFilters({ ...DEFAULT_FILTERS })}
              >
                <Text style={styles.modalResetText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.modalApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.sortModalSheet}>
            <Text style={styles.sortModalTitle}>Sort Activities By</Text>
            {SORT_OPTIONS.map((opt) => {
              const sel = selectedSort === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.sortOptionRow, sel && styles.sortOptionRowActive]}
                  onPress={() => {
                    setSelectedSort(opt.key);
                    setSortModalVisible(false);
                  }}
                >
                  <Text style={[styles.sortOptionText, sel && styles.sortOptionTextActive]}>
                    {opt.label}
                  </Text>
                  {sel ? <Text style={styles.sortCheckmark}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
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
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
  },
  clearSearchBtn: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 4,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  controlPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  controlPillActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  controlPillText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  controlPillTextActive: {
    color: '#15803D',
  },
  resetButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  resetButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  countText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  scrollContent: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    padding: SPACING.md,
  },
  skeleton: {
    marginBottom: SPACING.md,
    borderRadius: RADII.lg,
  },
  emptyWrap: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyResetBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADII.md,
  },
  emptyResetText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 18,
    color: '#9CA3AF',
    padding: 4,
  },
  modalBody: {
    marginBottom: SPACING.md,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipSelected: {
    backgroundColor: '#E0F2F1',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalResetBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  modalResetText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalApplyBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: RADII.md,
  },
  modalApplyText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  sortModalSheet: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: 'auto',
    marginTop: 'auto',
    borderRadius: RADII.lg,
    padding: SPACING.lg,
  },
  sortModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortOptionRowActive: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    borderRadius: RADII.sm,
  },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  sortOptionTextActive: {
    fontWeight: '700',
    color: '#15803D',
  },
  sortCheckmark: {
    fontSize: 16,
    color: '#15803D',
    fontWeight: 'bold',
  },
});
