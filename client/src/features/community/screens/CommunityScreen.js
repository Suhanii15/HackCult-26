import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TopBar, EmptyState } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { MICROCOPY } from '../../../constants/microcopy';

export default function CommunityScreen({ user }) {
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
