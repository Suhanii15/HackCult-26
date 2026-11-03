import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useHomeDashboard } from '../hooks';
import { useActiveActivities } from '../../activities/hooks';
import { useProfile } from '../../profile/hooks';
import HeroImpactCard from '../components/HeroImpactCard';
import SnapshotSection from '../components/SnapshotSection';
import SmartSuggestionCard from '../components/SmartSuggestionCard';
import { BellIcon } from '../../solar/components/SolarIcons';
import { scheduleDailyWelcomeNotification } from '../../../services/notificationService';

export default function HomeScreen({ user }) {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { data } = useHomeDashboard(user);
  const { data: activeList } = useActiveActivities();
  const { data: profile } = useProfile(user);

  const currentUser = profile || data?.user || user;
  const rawName = currentUser?.fullName || currentUser?.name || 'Alex';
  const firstName = rawName.split(' ')[0] || 'Alex';
  const initial = (firstName.trim()[0] || 'A').toUpperCase();
  const avatarUri = currentUser?.avatar || null;

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

  // Register daily 9 AM welcome notification with rotating quote
  useEffect(() => {
    scheduleDailyWelcomeNotification(firstName);
  }, [firstName]);

  return (
    <View style={styles.container}>
      {/* Restored Brand Teal-Mint Gradient Header */}
      <View style={styles.topCurvedBackground}>
        <Svg width="100%" height="260" viewBox="0 0 400 260" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="tealHeaderGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#B2DFDB" stopOpacity="0.9" />
              <Stop offset="65%" stopColor="#E0F2F1" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#F8FAF9" stopOpacity="0" />
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
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>

            {/* Greeting */}
            <Text style={styles.greetingText} numberOfLines={1}>
              {`${timeGreeting}, ${firstName}`}
            </Text>
          </TouchableOpacity>

          {/* Right Action Circle (Alerts & Notifications Screen) */}
          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Open alerts and notifications"
          >
            <BellIcon size={19} color="#0F172A" />
            <View style={styles.notificationDot} />
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
    paddingBottom: 110, // Padding so floating glass ellipse bar doesn't overlap
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? 16 : 14,
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
    borderColor: '#80CBC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#004D40',
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A', // Crisp dark text
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
