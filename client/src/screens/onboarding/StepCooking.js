import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../theme';
import IconTile from '../../components/IconTile';
import SliderWithPreview from '../../components/SliderWithPreview';
import OnboardingFooter from '../../components/OnboardingFooter';
import { useLanguage, tr } from '../../i18n/LanguageContext';

export default function StepCooking({
  data = {},
  onChange,
  onContinue,
  onSkip,
}) {
  const { t } = useLanguage();
  const [selectedFuels, setSelectedFuels] = useState(
    data.cooking?.fuels?.map((f) => f.type) || ['lpg']
  );
  const [noCookingFuel, setNoCookingFuel] = useState(data.cooking?.noCookingFuel || false);

  // LPG state
  const lpgInitial = data.cooking?.fuels?.find((f) => f.type === 'lpg');
  const [cylinderSizeKg, setCylinderSizeKg] = useState(lpgInitial?.cylinderSizeKg || 14.2);
  const [weeksPerCylinder, setWeeksPerCylinder] = useState(lpgInitial?.weeksPerCylinder || 6);

  // PNG state
  const pngInitial = data.cooking?.fuels?.find((f) => f.type === 'png');
  const [scmPerMonth, setScmPerMonth] = useState(pngInitial?.scmPerMonth || 15);

  const notifyChange = (newSelected, noFuel, cylSize, weeks, scm) => {
    if (noFuel) {
      onChange({
        cooking: {
          noCookingFuel: true,
          fuels: [],
        },
      });
      return;
    }

    const fuels = [];
    if (newSelected.includes('lpg')) {
      fuels.push({
        type: 'lpg',
        cylinderSizeKg: cylSize,
        weeksPerCylinder: weeks,
      });
    }
    if (newSelected.includes('png')) {
      fuels.push({
        type: 'png',
        scmPerMonth: scm,
      });
    }
    if (newSelected.includes('induction')) {
      fuels.push({
        type: 'induction',
      });
    }
    if (newSelected.includes('other')) {
      fuels.push({
        type: 'other',
      });
    }

    onChange({
      cooking: {
        noCookingFuel: false,
        fuels,
      },
    });
  };

  const toggleFuel = (type) => {
    setNoCookingFuel(false);
    let updated;
    if (selectedFuels.includes(type)) {
      updated = selectedFuels.filter((f) => f !== type);
    } else {
      updated = [...selectedFuels, type];
    }
    setSelectedFuels(updated);
    notifyChange(updated, false, cylinderSizeKg, weeksPerCylinder, scmPerMonth);
  };

  const handleNoCooking = () => {
    const next = !noCookingFuel;
    setNoCookingFuel(next);
    if (next) setSelectedFuels([]);
    notifyChange([], next, cylinderSizeKg, weeksPerCylinder, scmPerMonth);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('step3_title')}</Text>
        <Text style={styles.subtitle}>{t('step3_sub')}</Text>

        {/* Multi-select Fuel Tiles */}
        <View style={styles.tilesGrid}>
          <IconTile
            icon="🔥"
            title={t('tile_lpg_title')}
            subtitle={t('tile_lpg_sub')}
            selected={selectedFuels.includes('lpg')}
            onPress={() => toggleFuel('lpg')}
            style={styles.tileCol}
          />
          <IconTile
            icon="🔵"
            title={t('tile_png_title')}
            subtitle={t('tile_png_sub')}
            selected={selectedFuels.includes('png')}
            onPress={() => toggleFuel('png')}
            style={styles.tileCol}
          />
          <IconTile
            icon="⚡"
            title={t('tile_induction_title')}
            subtitle={t('tile_induction_sub')}
            selected={selectedFuels.includes('induction')}
            onPress={() => toggleFuel('induction')}
            style={styles.tileCol}
          />
          <IconTile
            icon="🪵"
            title={t('tile_other_fuel_title')}
            subtitle={t('tile_other_fuel_sub')}
            selected={selectedFuels.includes('other')}
            onPress={() => toggleFuel('other')}
            style={styles.tileCol}
          />
        </View>

        {/* "I don't cook / no cooking fuel" explicit zero button */}
        <TouchableOpacity
          style={[styles.noCookingBtn, noCookingFuel && styles.noCookingBtnActive]}
          onPress={handleNoCooking}
        >
          <Text style={[styles.noCookingText, noCookingFuel && styles.noCookingTextActive]}>
            {noCookingFuel ? t('no_cooking_fuel_reported') : t('no_cooking_fuel_btn')}
          </Text>
        </TouchableOpacity>

        {/* Inline LPG Panel if selected */}
        {selectedFuels.includes('lpg') && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>{t('lpg_details_title')}</Text>
              {/* Cylinder Size Selector */}
              <View style={styles.sizeToggleRow}>
                <TouchableOpacity
                  style={[styles.sizeBtn, cylinderSizeKg === 14.2 && styles.sizeBtnActive]}
                  onPress={() => {
                    setCylinderSizeKg(14.2);
                    notifyChange(selectedFuels, false, 14.2, weeksPerCylinder, scmPerMonth);
                  }}
                >
                  <Text style={[styles.sizeBtnText, cylinderSizeKg === 14.2 && styles.sizeBtnTextActive]}>
                    {tr('14.2 kg (Std)')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sizeBtn, cylinderSizeKg === 5 && styles.sizeBtnActive]}
                  onPress={() => {
                    setCylinderSizeKg(5);
                    notifyChange(selectedFuels, false, 5, weeksPerCylinder, scmPerMonth);
                  }}
                >
                  <Text style={[styles.sizeBtnText, cylinderSizeKg === 5 && styles.sizeBtnTextActive]}>
                    {tr('5 kg')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cylinder visual indicator */}
            <View style={styles.cylinderVisualRow}>
              <View style={styles.cylinderIconWrap}>
                <Text style={styles.cylinderEmoji}>🛢️</Text>
                <Text style={styles.cylinderCapText}>{cylinderSizeKg} kg</Text>
              </View>
              <View style={styles.cylinderStats}>
                <Text style={styles.cylinderStatVal}>
                  {(30 / (weeksPerCylinder * 7)).toFixed(2)} cylinders / month
                </Text>
                <Text style={styles.cylinderStatSub}>
                  One cylinder lasts approx {weeksPerCylinder} weeks
                </Text>
              </View>
            </View>

            {/* Weeks per cylinder slider */}
            <SliderWithPreview
              value={weeksPerCylinder}
              min={1}
              max={26}
              step={1}
              unit="weeks"
              label={t('lpg_weeks_slider_label')}
              snapMarks={[4, 6, 8, 12]}
              onChange={(val) => {
                setWeeksPerCylinder(val);
                notifyChange(selectedFuels, false, cylinderSizeKg, val, scmPerMonth);
              }}
            />
          </View>
        )}

        {/* Inline PNG Panel if selected */}
        {selectedFuels.includes('png') && (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{t('png_details_title')}</Text>
            <Text style={styles.detailSubtitle}>{t('png_details_sub')}</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{t('png_scm_label')}</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={String(scmPerMonth)}
                placeholder="e.g. 15"
                placeholderTextColor="#9CA3AF"
                onChangeText={(txt) => {
                  const num = parseFloat(txt) || 0;
                  setScmPerMonth(num);
                  notifyChange(selectedFuels, false, cylinderSizeKg, weeksPerCylinder, num);
                }}
              />
              <Text style={styles.inputHelper}>{tr('1 SCM ≈ 2.15 kg CO₂e')}</Text>
            </View>
          </View>
        )}

        {/* Inline Induction / Electric Panel note */}
        {selectedFuels.includes('induction') && (
          <View style={styles.infoNotice}>
            <Text style={styles.infoNoticeTitle}>{t('induction_notice_title')}</Text>
            <Text style={styles.infoNoticeText}>{t('induction_notice_text')}</Text>
          </View>
        )}
      </ScrollView>

      {/* Pinned Bottom Footer */}
      <OnboardingFooter
        canContinue={true}
        onContinue={onContinue}
        onSkip={onSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tileCol: {
    width: '48%',
    marginBottom: 10,
  },
  noCookingBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    marginVertical: 10,
  },
  noCookingBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  noCookingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  noCookingTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  detailSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  sizeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  sizeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sizeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sizeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sizeBtnTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  cylinderVisualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cylinderIconWrap: {
    alignItems: 'center',
    marginRight: 14,
  },
  cylinderEmoji: {
    fontSize: 28,
  },
  cylinderCapText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    marginTop: 2,
  },
  cylinderStats: {
    flex: 1,
  },
  cylinderStatVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
  cylinderStatSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  inputWrap: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  inputHelper: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  infoNotice: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  infoNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  infoNoticeText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
});
