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
import StepperPeople from '../../components/StepperPeople';
import SliderWithPreview from '../../components/SliderWithPreview';
import InfoSheet from '../../components/InfoSheet';
import OnboardingFooter from '../../components/OnboardingFooter';
import { useLanguage } from '../../i18n/LanguageContext';
import { billInrToKwh } from '../../engine';

export default function StepElectricity({
  mode = 'household',
  data = {},
  onChange,
  onContinue,
  onSkip,
}) {
  const { t } = useLanguage();
  const [members, setMembers] = useState(data.members || (mode === 'household' ? 4 : 1));
  const [roomShareCount, setRoomShareCount] = useState(data.roomShareCount || 1);
  const [sourceType, setSourceType] = useState(data.electricity?.sourceType || 'kwh');
  const [kwh, setKwh] = useState(typeof data.electricity?.kwh === 'number' ? data.electricity.kwh : 240);
  const [amountInINR, setAmountInINR] = useState(data.electricity?.amountInINR || 1600);
  const [hasSolar, setHasSolar] = useState(data.electricity?.solar?.hasSolar || false);
  const [solarKw, setSolarKw] = useState(data.electricity?.solar?.solarKw || 3);
  const [exportedKwh, setExportedKwh] = useState(data.electricity?.solar?.exportedKwh || 50);
  const [rentIncluded, setRentIncluded] = useState(data.electricity?.rentIncluded || false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);

  const tariffEstimate = billInrToKwh(amountInINR);

  const notifyChange = (updated) => {
    onChange({
      members: mode === 'household' ? (updated.members !== undefined ? updated.members : members) : 1,
      roomShareCount: mode === 'individual' ? (updated.roomShareCount !== undefined ? updated.roomShareCount : roomShareCount) : 1,
      electricity: {
        sourceType: updated.sourceType || sourceType,
        kwh: updated.kwh !== undefined ? updated.kwh : kwh,
        amountInINR: updated.amountInINR !== undefined ? updated.amountInINR : amountInINR,
        rentIncluded: updated.rentIncluded !== undefined ? updated.rentIncluded : rentIncluded,
        solar: {
          hasSolar: updated.hasSolar !== undefined ? updated.hasSolar : hasSolar,
          solarKw: updated.solarKw !== undefined ? updated.solarKw : solarKw,
          exportedKwh: updated.exportedKwh !== undefined ? updated.exportedKwh : exportedKwh,
        },
      },
    });
  };

  const handleSourceTypeSelect = (type) => {
    setSourceType(type);
    notifyChange({ sourceType: type });
  };

  const handleKwhChange = (val) => {
    setKwh(val);
    notifyChange({ kwh: val, sourceType: 'kwh' });
  };

  const handleAmountChange = (text) => {
    const num = parseFloat(text) || 0;
    setAmountInINR(num);
    notifyChange({ amountInINR: num, sourceType: 'amount' });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          {mode === 'household' ? t('step2_household_title') : t('step2_individual_title')}
        </Text>
        <Text style={styles.subtitle}>{t('step2_sub')}</Text>

        {/* Household members stepper or Room share */}
        {mode === 'household' ? (
          <StepperPeople
            value={members}
            min={1}
            max={12}
            label={t('household_members_label')}
            onChange={(val) => {
              setMembers(val);
              notifyChange({ members: val });
            }}
          />
        ) : (
          <StepperPeople
            value={roomShareCount}
            min={1}
            max={8}
            label={t('room_share_label')}
            onChange={(val) => {
              setRoomShareCount(val);
              notifyChange({ roomShareCount: val });
            }}
          />
        )}

        {/* Individual Mode: Is electricity included in rent? */}
        {mode === 'individual' ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('is_elec_included_label')}</Text>
            <View style={styles.tilesRow}>
              <IconTile
                icon="📄"
                title={t('elec_included_yes_title')}
                subtitle={t('elec_included_yes_sub')}
                selected={rentIncluded}
                onPress={() => {
                  setRentIncluded(true);
                  setSourceType('appliances');
                  notifyChange({ rentIncluded: true, sourceType: 'appliances' });
                }}
                style={styles.halfTile}
              />
              <IconTile
                icon="⚡"
                title={t('elec_included_no_title')}
                subtitle={t('elec_included_no_sub')}
                selected={!rentIncluded}
                onPress={() => {
                  setRentIncluded(false);
                  setSourceType('kwh');
                  notifyChange({ rentIncluded: false, sourceType: 'kwh' });
                }}
                style={styles.halfTile}
              />
            </View>
          </View>
        ) : null}

        {/* If Household OR Individual with separate meter: Choose input method */}
        {(mode === 'household' || (mode === 'individual' && !rentIncluded)) && (
          <View style={styles.fieldGroup}>
            <View style={styles.headerWithInfo}>
              <Text style={styles.fieldLabel}>{t('how_know_elec')}</Text>
              <TouchableOpacity onPress={() => setShowInfoSheet(true)}>
                <Text style={styles.infoLink}>{t('where_find_this')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tilesRow}>
              <IconTile
                icon="⚡"
                title={t('tile_kwh_title')}
                subtitle={t('tile_kwh_sub')}
                selected={sourceType === 'kwh'}
                onPress={() => handleSourceTypeSelect('kwh')}
                style={styles.thirdTile}
              />
              <IconTile
                icon="₹"
                title={t('tile_amount_title')}
                subtitle={t('tile_amount_sub')}
                selected={sourceType === 'amount'}
                onPress={() => handleSourceTypeSelect('amount')}
                style={styles.thirdTile}
              />
              <IconTile
                icon="❓"
                title={t('tile_not_sure_title')}
                subtitle={t('tile_not_sure_sub')}
                selected={sourceType === 'not_sure'}
                onPress={() => handleSourceTypeSelect('not_sure')}
                style={styles.thirdTile}
              />
            </View>

            {/* Sub-inputs depending on tile selected */}
            {sourceType === 'kwh' && (
              <SliderWithPreview
                value={kwh}
                min={0}
                max={1500}
                step={10}
                unit="kWh / mo"
                label={t('monthly_units_slider_label')}
                helperText={t('monthly_units_helper')}
                snapMarks={[100, 200, 350, 600]}
                onChange={handleKwhChange}
              />
            )}

            {sourceType === 'amount' && (
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>{t('monthly_bill_amt_label')}</Text>
                <View style={styles.amountInputRow}>
                  <Text style={styles.rupeePrefix}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    value={String(amountInINR)}
                    onChangeText={handleAmountChange}
                  />
                </View>
                {/* Estimated kWh banner */}
                <View style={styles.estimateBanner}>
                  <Text style={styles.estimateBannerText}>
                    {t('estimated_kwh_banner', { val: tariffEstimate.kwh })}
                  </Text>
                  <Text style={styles.estimateSubtext}>{tariffEstimate.assumption}</Text>
                </View>
              </View>
            )}

            {sourceType === 'not_sure' && (
              <View style={styles.notSureBanner}>
                <Text style={styles.notSureTitle}>{t('not_sure_banner_title')}</Text>
                <Text style={styles.notSureText}>{t('not_sure_banner_text')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Household Mode: Rooftop Solar Toggle */}
        {mode === 'household' && (
          <View style={styles.solarSection}>
            <View style={styles.solarToggleRow}>
              <View style={styles.solarTextWrap}>
                <Text style={styles.solarTitle}>{t('solar_title')}</Text>
                <Text style={styles.solarSubtitle}>{t('solar_sub')}</Text>
              </View>
              <TouchableOpacity
                style={[styles.togglePill, hasSolar ? styles.togglePillActive : styles.togglePillInactive]}
                onPress={() => {
                  const next = !hasSolar;
                  setHasSolar(next);
                  notifyChange({ hasSolar: next });
                }}
              >
                <Text style={[styles.toggleText, hasSolar && styles.toggleTextActive]}>
                  {hasSolar ? 'YES' : 'NO'}
                </Text>
              </TouchableOpacity>
            </View>

            {hasSolar && (
              <View style={styles.solarDetailsBox}>
                <SliderWithPreview
                  value={solarKw}
                  min={0.5}
                  max={10}
                  step={0.5}
                  unit="kW"
                  label={t('solar_capacity_label')}
                  snapMarks={[1, 2, 3, 5]}
                  onChange={(val) => {
                    setSolarKw(val);
                    notifyChange({ solarKw: val });
                  }}
                />
                <View style={styles.exportInputWrap}>
                  <Text style={styles.exportLabel}>{t('solar_export_label')}</Text>
                  <TextInput
                    style={styles.exportInput}
                    keyboardType="numeric"
                    placeholder="e.g. 50"
                    placeholderTextColor="#9CA3AF"
                    value={String(exportedKwh)}
                    onChangeText={(txt) => {
                      const num = parseFloat(txt) || 0;
                      setExportedKwh(num);
                      notifyChange({ exportedKwh: num });
                    }}
                  />
                  <Text style={styles.exportHelper}>{t('solar_export_helper')}</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Info Sheet modal for finding bill units */}
      <InfoSheet
        visible={showInfoSheet}
        title="Finding units on your electricity bill ⚡"
        content={`• In Gujarat (UGVCL, DGVCL, PGVCL, MGVCL, or Torrent Power), check the 'Units Consumed' or 'Total Consumption (kWh)' box on the front page of your bill.\n\n• For Torrent Power bills, look under 'Meter Reading Details' -> 'Units Billed'.\n\n• If you are on solar net-metering, check 'Net Imported Units'.`}
        onClose={() => setShowInfoSheet(false)}
      />

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
  fieldGroup: {
    marginVertical: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  headerWithInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLink: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfTile: {
    width: '48%',
  },
  thirdTile: {
    width: '31%',
    minHeight: 100,
    padding: 10,
  },
  amountBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingVertical: 6,
  },
  rupeePrefix: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primaryDark,
    flex: 1,
  },
  estimateBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  estimateBannerText: {
    color: COLORS.primaryDark,
    fontSize: 13,
  },
  estimateSubtext: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  notSureBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  notSureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  notSureText: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 4,
    lineHeight: 18,
  },
  solarSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginTop: 14,
  },
  solarToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  solarTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  solarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
  solarSubtitle: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  togglePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  togglePillActive: {
    backgroundColor: '#F59E0B',
  },
  togglePillInactive: {
    backgroundColor: '#E5E7EB',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  solarDetailsBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  exportInputWrap: {
    marginTop: 8,
  },
  exportLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  exportInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#92400E',
  },
  exportHelper: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
});
