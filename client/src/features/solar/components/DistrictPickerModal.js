import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { CloseIcon, CheckCircleIcon } from './SolarIcons';

const GUJARAT_DISTRICTS = [
  'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch',
  'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka',
  'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch',
  'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
  'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
  'Tapi', 'Vadodara', 'Valsad',
];

export default function DistrictPickerModal({
  visible,
  selectedDistrict,
  onSelect,
  onClose,
}) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return GUJARAT_DISTRICTS;
    const query = searchQuery.trim().toLowerCase();
    return GUJARAT_DISTRICTS.filter((d) => d.toLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('solar_district_label') || 'Select District'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close district picker">
            <CloseIcon size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('solar_district_search_placeholder') || 'Search district...'}
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
        </View>

        {/* List of Districts */}
        <FlatList
          data={filteredDistricts}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = item.toLowerCase() === (selectedDistrict || '').toLowerCase();
            return (
              <TouchableOpacity
                style={[styles.districtItem, isSelected && styles.districtItemSelected]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.districtText, isSelected && styles.districtTextSelected]}>
                  {item}
                </Text>
                {isSelected && <CheckCircleIcon size={18} color={COLORS.primaryDark} />}
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listContent: {
    padding: SPACING.md,
  },
  districtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  districtItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  districtText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  districtTextSelected: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primaryDark,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
