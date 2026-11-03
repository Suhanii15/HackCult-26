import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useHomeDashboard } from '../hooks';
import { useActiveActivities } from '../../activities/hooks';
import HeroImpactCard from '../components/HeroImpactCard';
import SnapshotSection from '../components/SnapshotSection';
import SmartSuggestionCard from '../components/SmartSuggestionCard';

export default function HomeScreen({ user }) {
  const navigation = useNavigation();
  const { t, openLanguageModal } = useLanguage();
  const { data } = useHomeDashboard(user);
  const { data: activeList } = useActiveActivities();

  const currentUser = data?.user || user;
  const rawName = currentUser?.fullName || currentUser?.name || 'Citizen';
  const firstName = rawName.split(' ')[0] || 'Friend';
  const initial = (firstName.trim()[0] || 'C').toUpperCase();

  // Metrics from user & dashboard
  const activeCount = activeList?.length ?? 2;
  const monthlyCO2 = Math.round(data?.monthlyCO2Kg || 128);
  const ecoScoreVal = currentUser?.ecoScore?.total || 72;
  const savedCO2Val = Math.max(12, Math.round(monthlyCO2 * 0.32)); // ~42 kg CO2 saved

  const handleOpenProfile = () => {
    navigation.navigate('Profile');
  };

  const handleOpenActivities = () => {
    navigation.navigate('Activities');
  };

  const handleOpenActiveChallenges = () => {
    navigation.navigate('Activities', {
      screen: 'ActiveActivities',
    });
  };

  const handleOpenSuggestion = () => {
    navigation.navigate('Activities', {
      screen: 'ActivityDetail',
      params: { key: 'energy_replace_led' },
    });
  };

  // Determine greeting based on current local hour
  const currentHour = new Date().getHours();
  let timeGreeting = 'Namaste';
  if (currentHour < 12) {
    timeGreeting = 'Good morning';
  } else if (currentHour < 17) {
    timeGreeting = 'Good afternoon';
  } else {
    timeGreeting = 'Good evening';
  }

  return (
    <View style={styles.container}>
      {/* Background Brand Teal-Mint Gradient Header */}
      <View style={styles.topCurvedBackground}>
        <Svg width="100%" height="260" viewBox="0 0 400 260" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="tealHeaderGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#B2DFDB" stopOpacity="0.85" />
              <Stop offset="65%" stopColor="#E0F2F1" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#F4F9F8" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="400" height="260" fill="url(#tealHeaderGrad)" />
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row matching Reference Image */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.8}
            onPress={handleOpenProfile}
          >
            {/* User Avatar Circle */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>

            {/* Greeting */}
            <Text style={styles.greetingText} numberOfLines={1}>
              {`${timeGreeting}, ${firstName}`}
            </Text>
          </TouchableOpacity>

          {/* Right Action Circle (Bell / Notification / Language) */}
          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.8}
            onPress={openLanguageModal}
            accessibilityLabel="Change language or notifications"
          >
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Main Impact Hero Card ("Your Impact This Month") */}
        <HeroImpactCard
          savedCO2Kg={savedCO2Val}
          percentChange={18}
        />

        {/* 2. "Your Snapshot" Section */}
        <SnapshotSection
          monthlyCO2Kg={monthlyCO2}
          ecoScore={ecoScoreVal}
          activeCount={activeCount}
          onSeeAll={handleOpenActivities}
          onOpenActivities={handleOpenActiveChallenges}
          onOpenFootprint={handleOpenActivities}
        />

        {/* 3. "Smart Suggestion" Section */}
        <SmartSuggestionCard
          suggestion={{
            title: t('smart_suggestion_desc'),
            saving: `${t('smart_suggestion_saving', { val: '128' })}`,
            icon: '💡',
          }}
          onPress={handleOpenSuggestion}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9', // Clean off-white
  },
  topCurvedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  scrollContent: {
    paddingBottom: 110, // Generous padding so floating glass ellipse bar doesn't overlap
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? 14 : 12,
    paddingBottom: SPACING.xs,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#80CBC4', // Brand teal
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#004D40', // Brand deep teal
  },
  greetingText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#004D40', // Brand deep teal
    letterSpacing: -0.2,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(224, 242, 241, 0.8)',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bellIcon: {
    fontSize: 16,
  },
});
