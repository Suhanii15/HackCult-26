import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Card, Button } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { formatInr } from '../utils/formatters';
import { useLanguage, tr } from '../../../i18n/LanguageContext';
import defaultSolarConfig from '../../../engine/config/solar.json';
import DistrictPickerModal from './DistrictPickerModal';
import { MapPinIcon, ChevronDownIcon, ZapIcon } from './SolarIcons';

export default function SolarInputCard({
  roofAreaSqft,
  monthlyBillInr,
  district,
  onRoofAreaChange,
  onMonthlyBillChange,
  onDistrictChange,
  onCalculate,
  isLoading,
  hasCalculated,
}) {
  const { t } = useLanguage();
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [isEditingRoof, setIsEditingRoof] = useState(false);
  const [isEditingBill, setIsEditingBill] = useState(false);

  const sqftPerKw = defaultSolarConfig.system.sqftPerKw || 100;
  const approxKw = Math.round((roofAreaSqft / sqftPerKw) * 10) / 10;

  // Sliders range
  const minRoof = 100;
  const maxRoof = 2000;
  const roofPercent = Math.min(100, Math.max(0, ((roofAreaSqft - minRoof) / (maxRoof - minRoof)) * 100));

  const minBill = 300;
  const maxBill = 10000;
  const billPercent = Math.min(100, Math.max(0, ((monthlyBillInr - minBill) / (maxBill - minBill)) * 100));

  const handleRoofStep = (delta) => {
    const next = Math.min(maxRoof, Math.max(minRoof, roofAreaSqft + delta));
    onRoofAreaChange(next);
  };

  const handleBillStep = (delta) => {
    const next = Math.min(maxBill, Math.max(minBill, monthlyBillInr + delta));
    onMonthlyBillChange(next);
  };

  return (
    <Card elevation="subtle" style={styles.card}>
      {/* District Selector Row */}
      <View style={styles.districtRow}>
        <View style={styles.districtLabelCol}>
          <Text style={styles.inputLabel}>{t('solar_district_label') || 'District'}</Text>
          <Text style={styles.stateSubtitle}>{tr('Gujarat (Rooftop Grid Policy)')}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsDistrictModalOpen(true)}
          style={styles.districtPill}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Change district, current is ${district}`}
        >
          <MapPinIcon size={14} color={COLORS.primaryDark} />
          <Text style={styles.districtPillText}>{district}</Text>
          <ChevronDownIcon size={12} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 1. Roof Area Input */}
      <View style={styles.inputSection}>
        <View style={styles.inputHeaderRow}>
          <Text style={styles.inputLabel}>{t('solar_roof_area_label') || 'Shadow-free Roof Area'}</Text>
          <TouchableOpacity onPress={() => setIsEditingRoof(!isEditingRoof)} style={styles.toggleEditBtn}>
            <Text style={styles.toggleEditText}>{isEditingRoof ? 'Done' : 'Type exact'}</Text>
          </TouchableOpacity>
        </View>

        {isEditingRoof ? (
          <View style={styles.directInputRow}>
            <TextInput
              style={styles.numericTextInput}
              keyboardType="numeric"
              defaultValue={String(roofAreaSqft)}
              onEndEditing={(e) => {
                const val = parseFloat(e.nativeEvent.text);
                if (!isNaN(val) && val >= minRoof && val <= maxRoof) {
                  onRoofAreaChange(val);
                }
              }}
              selectTextOnFocus
              autoFocus
            />
            <Text style={styles.unitSuffix}>{t('solar_roof_unit') || 'sq.ft'}</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditingRoof(true)} style={styles.displayValueRow}>
            <Text style={styles.bigValueText}>{roofAreaSqft}</Text>
            <Text style={styles.unitSuffix}>{t('solar_roof_unit') || 'sq.ft'}</Text>
          </TouchableOpacity>
        )}

        {/* Interactive Stepper & Track Bar */}
        <View style={styles.sliderControlRow}>
          <TouchableOpacity onPress={() => handleRoofStep(-50)} style={styles.stepBtn}>
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>

          <View style={styles.trackContainer}>
            <View style={[styles.filledTrack, { width: `${roofPercent}%`, backgroundColor: COLORS.energy }]} />
            <View style={[styles.thumb, { left: `${Math.min(94, Math.max(0, roofPercent - 3))}%`, borderColor: COLORS.energy }]} />
          </View>

          <TouchableOpacity onPress={() => handleRoofStep(50)} style={styles.stepBtn}>
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Live Helper Text under Roof Area */}
        <View style={styles.helperRow}>
          <ZapIcon size={14} color={COLORS.energy} />
          <Text style={styles.helperText}>
            {t('solar_roof_helper_fits', { kw: approxKw.toFixed(1) }) ||
              `About ${approxKw.toFixed(1)} kWp fits your roof`}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 2. Monthly Electricity Bill Input */}
      <View style={styles.inputSection}>
        <View style={styles.inputHeaderRow}>
          <Text style={styles.inputLabel}>{t('solar_monthly_bill_label') || 'Monthly Electricity Bill'}</Text>
          <TouchableOpacity onPress={() => setIsEditingBill(!isEditingBill)} style={styles.toggleEditBtn}>
            <Text style={styles.toggleEditText}>{isEditingBill ? 'Done' : 'Type exact'}</Text>
          </TouchableOpacity>
        </View>

        {isEditingBill ? (
          <View style={styles.directInputRow}>
            <TextInput
              style={styles.numericTextInput}
              keyboardType="numeric"
              defaultValue={String(monthlyBillInr)}
              onEndEditing={(e) => {
                const val = parseFloat(e.nativeEvent.text);
                if (!isNaN(val) && val >= minBill && val <= maxBill) {
                  onMonthlyBillChange(val);
                }
              }}
              selectTextOnFocus
              autoFocus
            />
            <Text style={styles.unitSuffix}>{t('solar_bill_unit') || 'INR'}</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditingBill(true)} style={styles.displayValueRow}>
            <Text style={styles.bigValueText}>{formatInr(monthlyBillInr)}</Text>
            <Text style={styles.monthSuffix}>{tr('/ month')}</Text>
          </TouchableOpacity>
        )}

        {/* Interactive Stepper & Track Bar */}
        <View style={styles.sliderControlRow}>
          <TouchableOpacity onPress={() => handleBillStep(-100)} style={styles.stepBtn}>
            <Text style={styles.stepBtnText}>−</Text>
          </TouchableOpacity>

          <View style={styles.trackContainer}>
            <View style={[styles.filledTrack, { width: `${billPercent}%`, backgroundColor: COLORS.primary }]} />
            <View style={[styles.thumb, { left: `${Math.min(94, Math.max(0, billPercent - 3))}%`, borderColor: COLORS.primary }]} />
          </View>

          <TouchableOpacity onPress={() => handleBillStep(100)} style={styles.stepBtn}>
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary Calculate Button */}
      <Button
        title={
          isLoading
            ? t('solar_recalculating') || 'Calculating...'
            : hasCalculated
            ? t('solar_btn_calculate') || 'Recalculate'
            : t('solar_btn_calculate') || 'Calculate Feasibility'
        }
        onPress={onCalculate}
        variant="primary"
        size="lg"
        loading={isLoading}
        style={styles.calculateBtn}
      />

      {/* District Picker Modal */}
      <DistrictPickerModal
        visible={isDistrictModalOpen}
        selectedDistrict={district}
        onSelect={(d) => onDistrictChange(d)}
        onClose={() => setIsDistrictModalOpen(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: SPACING.md,
  },
  districtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  districtLabelCol: {
    flex: 1,
  },
  inputLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  stateSubtitle: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  districtPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 137, 123, 0.3)',
    gap: 6,
  },
  districtPillText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginVertical: SPACING.md,
  },
  inputSection: {
    marginBottom: SPACING.xs,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  toggleEditBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  toggleEditText: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.primary,
    fontWeight: '600',
  },
  displayValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  bigValueText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  unitSuffix: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textSecondary,
  },
  monthSuffix: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
  },
  directInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  numericTextInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 120,
    marginRight: SPACING.sm,
  },
  sliderControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: RADII.full,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  trackContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: RADII.full,
    marginHorizontal: SPACING.md,
    justifyContent: 'center',
    position: 'relative',
  },
  filledTrack: {
    height: '100%',
    borderRadius: RADII.full,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: RADII.full,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    top: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.energyBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADII.md,
    marginTop: 4,
    gap: 6,
  },
  helperText: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.energy,
    fontWeight: '600',
    flex: 1,
  },
  calculateBtn: {
    marginTop: SPACING.sm,
  },
});
