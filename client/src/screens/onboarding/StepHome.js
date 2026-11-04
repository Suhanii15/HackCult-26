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
import { useLanguage, tr } from '../../i18n/LanguageContext';
import { config } from '../../engine';

const INDIAN_STATES = [
  'Gujarat', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Delhi',
  'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Telangana', 'West Bengal',
  'Haryana', 'Punjab', 'Kerala', 'Bihar', 'Andhra Pradesh', 'Odisha',
];

const STATE_DISTRICTS = {
  Gujarat: config.districts_gujarat || [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch',
    'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka',
    'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch',
    'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
    'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
    'Tapi', 'Vadodara', 'Valsad',
  ],
  Maharashtra: [
    'Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik',
    'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai', 'Nanded', 'Satara',
  ],
  Rajasthan: [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Bhilwara', 'Alwar', 'Sikar', 'Bharatpur',
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa',
  ],
  Delhi: [
    'New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'South West Delhi', 'North West Delhi', 'North East Delhi', 'Shahdara',
  ],
  Karnataka: [
    'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Ballari', 'Shivamogga', 'Tumakuru',
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Kanchipuram',
  ],
  'Uttar Pradesh': [
    'Gautam Buddha Nagar (Noida)', 'Lucknow', 'Kanpur', 'Ghaziabad', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut', 'Gorakhpur', 'Bareilly', 'Aligarh',
  ],
  Telangana: [
    'Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam',
  ],
  'West Bengal': [
    'Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah', 'Hooghly', 'Darjeeling', 'Siliguri', 'Paschim Bardhaman', 'Purba Medinipur',
  ],
  Haryana: [
    'Gurugram', 'Faridabad', 'Panchkula', 'Ambala', 'Karnal', 'Panipat', 'Hisar', 'Rohtak', 'Sonipat', 'Yamunanagar',
  ],
  Punjab: [
    'SAS Nagar (Mohali)', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Pathankot', 'Moga',
  ],
  Kerala: [
    'Ernakulam (Kochi)', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad',
  ],
  Bihar: [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai',
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada (NTR)', 'Guntur', 'Tirupati', 'Kurnool', 'Nellore', 'Kakinada', 'Rajahmundry', 'Anantapur',
  ],
  Odisha: [
    'Khordha (Bhubaneswar)', 'Cuttack', 'Sundargarh (Rourkela)', 'Ganjam', 'Puri', 'Sambalpur', 'Balasore', 'Bhadrak',
  ],
};

const POPULAR_CITIES_BY_DISTRICT = {
  // Gujarat
  Ahmedabad: ['Vastrapur', 'Navrangpura', 'Satellite', 'Maninagar', 'Chandkheda', 'Bodakdev', 'Bopal', 'Ghatlodia'],
  Surat: ['Adajan', 'Athwa', 'Varachha', 'Katargam', 'Rander', 'Udhna', 'Vesu'],
  Vadodara: ['Alkapuri', 'Sayajigunj', 'Fatehgunj', 'Manjalpur', 'Gotri', 'Karelibaug'],
  Rajkot: ['Kalavad Road', 'Yagnik Road', 'University Road', 'Kothariya', 'Mavdi'],
  Gandhinagar: ['Sector 1-10', 'Sector 11-20', 'Sector 21-30', 'Infocity', 'Kudasan', 'Randesan'],
  Bhavnagar: ['Kalanala', 'Ghogha Circle', 'Takhteshwar', 'Subhashnagar'],
  Jamnagar: ['Digjam', 'Patel Colony', 'Indira Marg', 'Ranjit Nagar'],

  // Maharashtra
  'Mumbai City': ['Colaba', 'Marine Drive', 'Dadar', 'Worli', 'Byculla', 'Fort'],
  'Mumbai Suburban': ['Andheri West', 'Andheri East', 'Bandra', 'Borivali', 'Goregaon', 'Powai', 'Malad', 'Juhu'],
  Pune: ['Baner', 'Kothrud', 'Hinjawadi', 'Viman Nagar', 'Shivajinagar', 'Hadapsar', 'Wakad', 'Aundh'],
  Nagpur: ['Dharampeth', 'Sitabuldi', 'Manish Nagar', 'Wardha Road', 'Civil Lines'],
  Thane: ['Ghodbunder Road', 'Thane West', 'Majiwada', 'Vartak Nagar', 'Naupada', 'Kopri'],
  'Navi Mumbai': ['Vashi', 'Nerul', 'Kharghar', 'Belapur', 'Seawoods', 'Airoli'],
  Nashik: ['College Road', 'Gangapur Road', 'Indira Nagar', 'Panchavati'],

  // Rajasthan
  Jaipur: ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C-Scheme', 'Raja Park', 'Jagatpura'],
  Jodhpur: ['Ratanada', 'Sardarpura', 'Shastri Nagar', 'Paota'],
  Udaipur: ['Fatehpura', 'Hiran Magri', 'Panchwati', 'Sukher'],
  Kota: ['Vigyan Nagar', 'Talwandi', 'Mahaveer Nagar', 'Dadabari'],

  // Madhya Pradesh
  Indore: ['Vijay Nagar', 'Palasia', 'Bhawarkua', 'Rajwada', 'AB Road', 'Rau'],
  Bhopal: ['MP Nagar', 'Arera Colony', 'Kolar Road', 'Hoshangabad Road', 'Shahpura'],
  Gwalior: ['City Centre', 'Lashkar', 'Morar', 'Thatipur'],

  // Delhi
  'New Delhi': ['Connaught Place', 'Chanakyapuri', 'Barakhamba Road', 'Gole Market'],
  'South Delhi': ['Hauz Khas', 'Greater Kailash', 'Saket', 'Vasant Kunj', 'Lajpat Nagar', 'Malviya Nagar'],
  'Central Delhi': ['Karol Bagh', 'Pahar Ganj', 'Daryaganj', 'Rajinder Nagar'],
  'West Delhi': ['Rajouri Garden', 'Punjabi Bagh', 'Janakpuri', 'Tilak Nagar', 'Dwarka'],
  'North Delhi': ['Civil Lines', 'Model Town', 'Kamla Nagar', 'Pitampura'],

  // Karnataka
  'Bengaluru Urban': ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Electronic City', 'Hebbal', 'Marathahalli', 'Bellandur'],
  Mysuru: ['Gokulam', 'Jayalakshmipuram', 'Kuvempunagar', 'Vijayanagar', 'Saraswathipuram'],

  // Tamil Nadu
  Chennai: ['T. Nagar', 'Adyar', 'Anna Nagar', 'Velachery', 'Mylapore', 'OMR / Thoraipakkam', 'Besant Nagar'],
  Coimbatore: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony'],

  // Uttar Pradesh
  'Gautam Buddha Nagar (Noida)': ['Sector 62', 'Sector 18', 'Sector 137', 'Sector 76', 'Greater Noida West', 'Pari Chowk'],
  Lucknow: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Mahanagar'],
  Kanpur: ['Civil Lines', 'Swaroop Nagar', 'Kakadeo', 'Kidwai Nagar'],

  // Telangana
  Hyderabad: ['Hitec City', 'Gachibowli', 'Madhapur', 'Banjara Hills', 'Jubilee Hills', 'Kukatpally', 'Secunderabad', 'Kondapur'],

  // West Bengal
  Kolkata: ['Salt Lake', 'New Town', 'Ballygunge', 'Park Street', 'Behala', 'Dum Dum', 'Alipore'],

  // Haryana
  Gurugram: ['Cyber City', 'DLF Phase 1-5', 'Golf Course Road', 'Sohna Road', 'Sector 56', 'Sector 48'],
  Faridabad: ['Sector 15', 'Sector 21', 'Greenfield Colony', 'NIT'],

  // Punjab
  'SAS Nagar (Mohali)': ['Sector 68-71', 'Sector 76-80', 'Aerocity', 'Kharar'],
  Ludhiana: ['Model Town', 'Sarabha Nagar', 'Civil Lines', 'BRS Nagar'],

  // Kerala
  'Ernakulam (Kochi)': ['Kakkanad', 'Edappally', 'Marine Drive', 'Palarivattom', 'Fort Kochi', 'Panampilly Nagar'],
  Thiruvananthapuram: ['Kowdiar', 'Vellayambalam', 'Technopark Area', 'Pattom'],

  // Bihar
  Patna: ['Boring Road', 'Kankarbagh', 'Bailey Road', 'Patliputra Colony', 'Danapur'],

  // Andhra Pradesh
  Visakhapatnam: ['MVP Colony', 'Gajuwaka', 'Madhurawada', 'Siripuram', 'Seethammadhara'],
  'Vijayawada (NTR)': ['Benz Circle', 'Governorpet', 'Moghalrajpuram'],

  // Odisha
  'Khordha (Bhubaneswar)': ['Saheed Nagar', 'Patia', 'Jayadev Vihar', 'Chandrasekharpur', 'Khandagiri'],
};

const DEFAULT_AREAS = [
  'Central Zone',
  'North Zone',
  'South Zone',
  'West Zone',
  'East Zone',
  'Downtown / Main Market',
  'Suburban Area',
];

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
  const [searchCity, setSearchCity] = useState('');

  // Dynamically get districts based on selected state
  const stateDistricts = STATE_DISTRICTS[state] || config.districts_gujarat || [];
  const filteredDistricts = stateDistricts.filter((d) =>
    d.toLowerCase().includes(searchDistrict.toLowerCase().trim())
  );

  // Dynamically get cities/areas based on selected district
  const baseCities = POPULAR_CITIES_BY_DISTRICT[district] || DEFAULT_AREAS;
  const filteredCities = baseCities.filter((c) =>
    c.toLowerCase().includes(searchCity.toLowerCase().trim())
  );

  const handleSelectState = (st) => {
    setState(st);
    setShowStateModal(false);
    setSearchDistrict('');
    setSearchCity('');

    const newDistricts = STATE_DISTRICTS[st] || config.districts_gujarat || ['Central District'];
    const defaultDistrict = newDistricts[0] || 'Central District';
    const citiesForDist = POPULAR_CITIES_BY_DISTRICT[defaultDistrict] || DEFAULT_AREAS;
    const defaultCity = citiesForDist[0] || 'Central Zone';

    setDistrict(defaultDistrict);
    setCity(defaultCity);
    onChange({ state: st, district: defaultDistrict, city: defaultCity });
  };

  const handleSelectDistrict = (dist) => {
    setDistrict(dist);
    setShowDistrictModal(false);
    setSearchDistrict('');
    setSearchCity('');

    const citiesForDist = POPULAR_CITIES_BY_DISTRICT[dist] || DEFAULT_AREAS;
    const defaultCity = citiesForDist[0] || 'Central Zone';
    setCity(defaultCity);
    onChange({ state, district: dist, city: defaultCity });
  };

  const handleSelectCity = (c) => {
    setCity(c);
    setShowCityModal(false);
    setSearchCity('');
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

        {/* 1. State Selector */}
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

        {/* 2. District Picker (Filtered by State) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            {t('district_label')} ({state}) <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowDistrictModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.pickerBtnText}>{district || t('select_district')}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Major City / Area Picker (Filtered by District) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            {t('city_label')} ({district})
          </Text>
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
              <Text style={styles.closeBtnText}>{tr('Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* District Picker Modal */}
      <Modal visible={showDistrictModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select District ({state})</Text>
            <TextInput
              style={styles.searchBar}
              placeholder={`Search district in ${state}...`}
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
              {/* Allow custom district if search has no exact match */}
              {searchDistrict.trim().length > 1 && !stateDistricts.includes(searchDistrict.trim()) && (
                <TouchableOpacity
                  style={[styles.modalItem, { backgroundColor: '#F0FDF4' }]}
                  onPress={() => handleSelectDistrict(searchDistrict.trim())}
                >
                  <Text style={[styles.modalItemText, { color: COLORS.primary, fontWeight: '700' }]}>
                    + Use "{searchDistrict.trim()}"
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowDistrictModal(false)}>
              <Text style={styles.closeBtnText}>{tr('Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* City / Area Picker Modal */}
      <Modal visible={showCityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Area / City ({district})</Text>
            <TextInput
              style={styles.searchBar}
              placeholder={`Search or type area in ${district}...`}
              placeholderTextColor="#9CA3AF"
              value={searchCity}
              onChangeText={setSearchCity}
            />
            <ScrollView style={{ maxHeight: 300 }}>
              {filteredCities.map((c) => (
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
              {/* Allow custom city / area if search has no exact match */}
              {searchCity.trim().length > 1 && !baseCities.includes(searchCity.trim()) && (
                <TouchableOpacity
                  style={[styles.modalItem, { backgroundColor: '#F0FDF4' }]}
                  onPress={() => handleSelectCity(searchCity.trim())}
                >
                  <Text style={[styles.modalItemText, { color: COLORS.primary, fontWeight: '700' }]}>
                    + Use "{searchCity.trim()}"
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCityModal(false)}>
              <Text style={styles.closeBtnText}>{tr('Cancel')}</Text>
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
