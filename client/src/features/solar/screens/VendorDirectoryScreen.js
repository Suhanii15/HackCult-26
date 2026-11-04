import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Card, Chip, Button, LottieLoader, EmptyState } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { useLanguage, tr } from '../../../i18n/LanguageContext';
import { useSolarVendors } from '../hooks';
import DistrictPickerModal from '../components/DistrictPickerModal';
import {
  ArrowLeftIcon,
  SunIcon,
  ZapIcon,
  LeafIcon,
  MapPinIcon,
  ChevronDownIcon,
  StarIcon,
  PhoneIcon,
  ShieldCheckIcon,
  InfoIcon,
  AlertTriangleIcon,
} from '../components/SolarIcons';

const CATEGORIES = [
  { key: 'solar_installer', label: 'Solar Installers', iconType: 'sun' },
  { key: 'energy_auditor', label: 'Energy Auditors', iconType: 'zap' },
  { key: 'waste_recycler', label: 'Recyclers', iconType: 'leaf' },
];

export default function VendorDirectoryScreen({ route, navigation }) {
  const { t } = useLanguage();
  const initialCategory = route?.params?.category || 'solar_installer';
  const initialDistrict = route?.params?.district || 'Ahmedabad';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);

  // Fetch vendors from API (with instant static fallback)
  const { data, isLoading, error, refetch } = useSolarVendors({
    category: selectedCategory,
    district: selectedDistrict === 'All' ? undefined : selectedDistrict,
  });

  const vendors = data?.data || [];

  const handleCallVendor = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch((err) =>
        console.warn('Cannot open phone dialer:', err)
      );
    }
  };

  const renderCategoryIcon = (iconType, isActive) => {
    const color = isActive ? COLORS.primaryDark : COLORS.textSecondary;
    if (iconType === 'sun') return <SunIcon size={14} color={color} />;
    if (iconType === 'zap') return <ZapIcon size={14} color={color} />;
    return <LeafIcon size={14} color={color} />;
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.topCurvedBackground}>
        <Svg width="100%" height="180" viewBox="0 0 400 180" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="vendorHeaderGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#B2DFDB" stopOpacity="0.8" />
              <Stop offset="70%" stopColor="#E0F2F1" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#F8FAF9" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="400" height="180" fill="url(#vendorHeaderGrad)" />
        </Svg>
      </View>

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeftIcon size={18} c olor={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('vendor_directory_title') || 'Solar Installers'}</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          Category Chips
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <Chip
                key={cat.key}
                label={cat.label}
                icon={renderCategoryIcon(cat.iconType, isActive)}
                active={isActive}
                onPress={() => setSelectedCategory(cat.key)}
                style={styles.filterChip}
              />
            );
          })}

          {/* District Picker Pill Chip */}
          <TouchableOpacity
            style={[styles.districtFilterPill, selectedDistrict !== 'All' && styles.districtFilterPillActive]}
            onPress={() => setIsDistrictModalOpen(true)}
            activeOpacity={0.8}
            accessibilityLabel="Filter by district"
          >
            <MapPinIcon size={13} color={selectedDistrict !== 'All' ? COLORS.primaryDark : COLORS.textSecondary} />
            <Text
              style={[
                styles.districtPillLabel,
                selectedDistrict !== 'All' && styles.districtPillLabelActive,
              ]}
            >
              {selectedDistrict === 'All' ? t('vendor_filter_all_districts') || 'All Districts' : selectedDistrict}
            </Text>
            <ChevronDownIcon size={10} color={selectedDistrict !== 'All' ? COLORS.primaryDark : COLORS.textSecondary} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Vendor List */}
      {isLoading ? (
        <LottieLoader size={150} message={tr('Finding verified installers in Gujarat...')} />
      ) : error && vendors.length === 0 ? (
        <EmptyState
          icon={<AlertTriangleIcon size={28} color={COLORS.danger} />}
          title={tr('Failed to Load Installers')}
          message={error.message || 'Please check your connection and try again.'}
          actionLabel={tr('Retry')}
          onAction={refetch}
        />
      ) : vendors.length === 0 ? (
        <EmptyState
          icon={<SunIcon size={32} color={COLORS.energy} />}
          title={t('vendor_empty_title') || 'No Installers Found'}
          message={
            t('vendor_empty_msg') ||
            `No empanelled installers found for ${selectedDistrict}. Try switching to 'All Districts'.`
          }
          actionLabel={t('vendor_filter_all_districts') || 'Show All Districts'}
          onAction={() => setSelectedDistrict('All')}
        />
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item._id || item.name}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <View style={styles.footerContainer}>
              <View style={styles.footerNoteBox}>
                <InfoIcon size={16} color={COLORS.textSecondary} />
                <Text style={styles.footerNote}>
                  {t('vendor_demo_footer') ||
                    'Sample listings for demonstration. Use the official portal for empanelled installers.'}
                </Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => {
            const isDemo = item.isDemo !== false;
            return (
              <Card elevation="subtle" style={styles.vendorCard}>
                <View style={styles.vendorHeader}>
                  <View style={styles.vendorTitleCol}>
                    <Text style={styles.vendorName}>{item.name}</Text>
                    {item.address ? (
                      <View style={styles.addressRow}>
                        <MapPinIcon size={12} color={COLORS.textSecondary} />
                        <Text style={styles.vendorAddress} numberOfLines={1}>
                          {item.address}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {isDemo && (
                    <Chip
                      label={t('vendor_demo_badge') || 'Demo listing'}
                      ease="medium"
                      style={styles.demoBadge}
                    />
                  )}
                </View>

                {/* Rating & Coverage Districts Row */}
                <View style={styles.metaRow}>
                  <View style={styles.ratingBadge}>
                    <StarIcon size={13} color={COLORS.warning} />
                    <Text style={styles.ratingText}>
                      {item.rating || 4.5} ({item.reviewCount || 20}+ reviews)
                    </Text>
                  </View>

                  <Text style={styles.districtsServed} numberOfLines={1}>
                    Coverage: {Array.isArray(item.districts) ? item.districts.slice(0, 3).join(', ') : selectedDistrict}
                  </Text>
                </View>

                {/* Action Row */}
                <View style={styles.actionRow}>
                  <Button
                    title={isDemo ? item.phone || 'Demo Phone' : t('vendor_btn_call') || 'Call'}
                    icon={<PhoneIcon size={14} color={isDemo ? COLORS.textSecondary : COLORS.white} />}
                    variant={isDemo ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={isDemo}
                    onPress={() => handleCallVendor(item.phone)}
                    style={styles.callBtn}
                  />

                  {item.isEmpanelled && (
                    <View style={styles.empanelledTag}>
                      <ShieldCheckIcon size={14} color={COLORS.primaryDark} />
                      <Text style={styles.empanelledText}>{tr('GEDA / MNRE Empanelled')}</Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* District Picker Modal */}
      <DistrictPickerModal
        visible={isDistrictModalOpen}
        selectedDistrict={selectedDistrict}
        onSelect={(d) => setSelectedDistrict(d)}
        onClose={() => setIsDistrictModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  topCurvedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    zIndex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: RADII.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  filtersWrapper: {
    paddingVertical: SPACING.xs,
    zIndex: 1,
  },
  filtersScrollContent: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.xs,
  },
  districtFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: COLORS.white,
    gap: 6,
  },
  districtFilterPillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  districtPillLabel: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  districtPillLabelActive: {
    color: COLORS.primaryDark,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  vendorCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.xl,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  vendorTitleCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  vendorName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  vendorAddress: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    flex: 1,
  },
  demoBadge: {
    alignSelf: 'flex-start',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.sm,
    gap: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    color: '#92400E',
    fontWeight: '700',
  },
  districtsServed: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    maxWidth: '55%',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: SPACING.sm,
    marginTop: 4,
  },
  callBtn: {
    minWidth: 120,
  },
  empanelledTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    gap: 4,
  },
  empanelledText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  footerContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  footerNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: RADII.md,
    padding: SPACING.md,
    gap: 8,
  },
  footerNote: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
