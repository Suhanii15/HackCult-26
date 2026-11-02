import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADII, SPACING } from '../../theme';
import { useLanguage } from '../../i18n/LanguageContext';

export default function TopBar({
  title,
  isHome = false,
  user,
  onAvatarPress,
  style,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useLanguage();

  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else if (navigation) {
      navigation.navigate('Profile');
    }
  };

  // Determine user display initial
  const rawName = user?.fullName || user?.name || '';
  const initial = (rawName.trim()[0] || 'C').toUpperCase();

  // Greeting for Home
  const greeting = isHome
    ? `${t('greeting_prefix') || 'Namaste'}, ${rawName.split(' ')[0] || t('greeting_default') || 'Citizen'} 🌿`
    : title;

  return (
    <View style={[styles.topBar, style]}>
      <View style={styles.leftContainer}>
        <Text style={[styles.title, isHome && styles.greetingTitle]} numberOfLines={1}>
          {greeting}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleAvatarPress}
        activeOpacity={0.8}
        style={styles.avatarButton}
        accessibilityRole="button"
        accessibilityLabel="Open user profile"
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  greetingTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  avatarButton: {
    padding: 2,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: RADII.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
