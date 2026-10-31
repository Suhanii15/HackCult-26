import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { COLORS } from '../../theme';
import OnboardingFooter from '../../components/OnboardingFooter';
import { useLanguage } from '../../i18n/LanguageContext';
import { config } from '../../engine';

const INDIAN_STATES = [
  'Gujarat', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Delhi',
  'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Telangana', 'West Bengal',
  'Haryana', 'Punjab', 'Kerala', 'Bihar', 'Andhra Pradesh', 'Odisha',
];

const GUJARAT_CITIES_BY_DISTRICT = {
  Ahmedabad: ['Vastrapur', 'Navrangpura', 'Satellite', 'Maninagar', 'Chandkheda', 'Bodakdev', 'Bopal', 'Ghatlodia'],
  Surat: ['Adajan', 'Athwa', 'Varachha', 'Katargam', 'Rander', 'Udhna', 'Vesu'],
  Vadodara: ['Alkapuri', 'Sayajigunj', 'Fatehgunj', 'Manjalpur', 'Gotri', 'Karelibaug'],
  Rajkot: ['Kalavad Road', 'Yagnik Road', 'University Road', 'Kothariya', 'Mavdi'],
  Gandhinagar: ['Sector 1-10', 'Sector 11-20', 'Sector 21-30', 'Infocity', 'Kudasan', 'Randesan'],
};

export default function StepHome({
  data = {},
  onChange,
  onContinue,
  onSkip,
}) {
  const { t } = useLanguage();
  const [state, setState] = useState(data.state || 'Gujarat');
  const [district, setDistrict] = useState(data.district || 'Ahmedabad');
  const [city, setCity] = useState(data.city || 'Vastrapur');

  const [showStateModal, setShowStateModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [searchDistrict, setSearchDistrict] = useState('');

  const districts = config.districts_gujarat || [];
  const filteredDistricts = districts.filter((d) =>
    d.toLowerCase().includes(searchDistrict.toLowerCase())
  );

  const availableCities = GUJARAT_CITIES_BY_DISTRICT[district] || ['Central Area', 'North Zone', 'South Zone', 'West Zone', 'East Zone'];

  const handleSelectState = (st) => {
    setState(st);
    setShowStateModal(false);
    onChange({ state: st, district, city });
  };

  const handleSelectDistrict = (dist) => {
    setDistrict(dist);
    setShowDistrictModal(false);
    const defaultCity = (GUJARAT_CITIES_BY_DISTRICT[dist] && GUJARAT_CITIES_BY_DISTRICT[dist][0]) || 'Central Area';
    setCity(defaultCity);
    onChange({ state, district: dist, city: defaultCity });
  };

  const handleSelectCity = (c) => {
    setCity(c);
    setShowCityModal(false);
    onChange({ state, district, city: c });
  };

  const handleContinue = () => {
    onChange({ state, district, city });
    onContinue();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('step1_title')}</Text>
        <Text style={styles.subtitle}>{t('step1_sub')}</Text>

        {/* 1. State Selector (Selectable - Gujarat default) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('state_label')} <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowStateModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.pickerBtnText}>{state}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* 2. District Picker (Searchable) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('district_label')} <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowDistrictModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.pickerBtnText}>{district || t('select_district')}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Major City / Area Picker (Clean list, no random text input!) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('city_label')}</Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowCityModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.pickerBtnText}>{city || t('select_city')}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Location summary badge */}
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryEmoji}>📍</Text>
          <Text style={styles.summaryText}>
            Selected: <Text style={{ fontWeight: '800' }}>{city}, {district}, {state}</Text>
          </Text>
        </View>
      </ScrollView>

      {/* State Picker Modal */}
      <Modal visible={showStateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('select_state_modal_title')}</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {INDIAN_STATES.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.modalItem, state === st && styles.modalItemSelected]}
                  onPress={() => handleSelectState(st)}
                >
                  <Text style={[styles.modalItemText, state === st && styles.modalItemTextSelected]}>
                    {st} {st === 'Gujarat' ? '🌿 (GEDA Host)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowStateModal(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* District Picker Modal */}
      <Modal visible={showDistrictModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('select_district_modal_title')}</Text>
            <TextInput
              style={styles.searchBar}
              placeholder={t('search_placeholder')}
              placeholderTextColor="#9CA3AF"
              value={searchDistrict}
              onChangeText={setSearchDistrict}
            />
            <ScrollView style={{ maxHeight: 300 }}>
              {filteredDistricts.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.modalItem, district === d && styles.modalItemSelected]}
                  onPress={() => handleSelectDistrict(d)}
                >
                  <Text style={[styles.modalItemText, district === d && styles.modalItemTextSelected]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowDistrictModal(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* City / Area Picker Modal */}
      <Modal visible={showCityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select City / Area in {district}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {availableCities.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.modalItem, city === c && styles.modalItemSelected]}
                  onPress={() => handleSelectCity(c)}
                >
                  <Text style={[styles.modalItemText, city === c && styles.modalItemTextSelected]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCityModal(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pinned Bottom Footer */}
      <OnboardingFooter
        canContinue={Boolean(state && district)}
        onContinue={handleContinue}
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
    marginBottom: 20,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  pickerBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerBtnText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  pickerArrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  summaryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  searchBar: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemSelected: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalItemText: {
    fontSize: 14,
    color: '#374151',
  },
  modalItemTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  closeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
});
