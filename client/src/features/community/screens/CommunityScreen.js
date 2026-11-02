import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TopBar } from '../../../components/ui';
import { COLORS } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function CommunityScreen({ user }) {
  const { t } = useLanguage();
  const screenTitle = t('tab_community');

  return (
    <View style={styles.container}>
      <TopBar title={screenTitle} user={user} />
      <View style={styles.centerContainer}>
        <Text style={styles.screenNameText}>{screenTitle}</Text>
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
  },
  screenNameText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
});
