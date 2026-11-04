import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TopBar, EmptyState } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { MICROCOPY } from '../../../constants/microcopy';

export default function CommunityScreen({ user }) {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const screenTitle = t('tab_community') || 'Community';

  return (
    <View style={styles.container}>
      <TopBar title={screenTitle} user={user} />
      <View style={styles.centerContainer}>
        <EmptyState
          icon="💬"
          title="Community Vibe"
          message={MICROCOPY.emptyStates.community[0] + ' ' + MICROCOPY.emptyStates.community[1]}
        />

        <TouchableOpacity
          style={styles.leaderboardCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text style={styles.leaderboardIcon}>🏆</Text>
          <View style={styles.leaderboardTextWrap}>
            <Text style={styles.leaderboardTitle}>Explore Gujarat Leaderboard</Text>
            <Text style={styles.leaderboardSubtitle}>See top eco citizens in your area & district</Text>
          </View>
          <Text style={styles.leaderboardArrow}>➔</Text>
        </TouchableOpacity>

        <View style={styles.badgeBox}>
          <Text style={styles.badgeText}>🌱 Gujarat Green Champions Network</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 110,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
    borderRadius: RADII.lg || 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: SPACING.lg,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  leaderboardIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  leaderboardTextWrap: {
    flex: 1,
  },
  leaderboardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 2,
  },
  leaderboardSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  leaderboardArrow: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
    marginLeft: 8,
  },
  badgeBox: {
    marginTop: SPACING.md,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.full || 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
});
