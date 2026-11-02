import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, EmptyState } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  useProfile,
  useProfileLikedActivities,
  useProfileHiddenActivities,
  useRestoreHiddenActivity,
} from '../hooks';

export default function ProfileScreen({ user, onLogout }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t, language, openLanguageModal } = useLanguage();

  const { data: profile } = useProfile(user);
  const { data: likedActivities } = useProfileLikedActivities();
  const { data: hiddenActivities } = useProfileHiddenActivities();
  const restoreMutation = useRestoreHiddenActivity();

  const rawName = profile?.fullName || profile?.name || 'Priya Patel';
  const initial = (rawName.trim()[0] || 'C').toUpperCase();
  const district = profile?.district || 'Ahmedabad, Gujarat';
  const points = profile?.totalPoints || 120;

  const langLabel =
    language === 'gu'
      ? 'ગુજરાતી (Gujarati)'
      : language === 'hi'
      ? 'हिन्दी (Hindi)'
      : 'English';

  const handleRestore = (id) => {
    restoreMutation.mutate(id);
  };

  return (
    <View style={styles.container}>
      {/* Header with Back button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile_title') || 'Profile'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard} elevation="card">
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.userName}>{rawName}</Text>
          <Text style={styles.userDistrict}>📍 {district}</Text>

          <View style={styles.pointsPill}>
            <Text style={styles.pointsLabel}>🏆 {t('profile_points') || 'Total Points'}:</Text>
            <Text style={styles.pointsValue}>{points} pts</Text>
          </View>
        </Card>

        {/* Language Switcher Setting */}
        <Card style={styles.settingCard} elevation="subtle">
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>🌐 {t('profile_language') || 'Language'}</Text>
              <Text style={styles.settingValue}>{langLabel}</Text>
            </View>
            <Button
              title="Change"
              variant="outline"
              size="sm"
              onPress={openLanguageModal}
            />
          </View>
        </Card>

        {/* Liked Activities Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            ❤️ {t('profile_liked_title') || 'Liked Activities'}
          </Text>
        </View>

        {likedActivities && likedActivities.length > 0 ? (
          likedActivities.map((item) => {
            const title = item.titleKey && t(item.titleKey) !== item.titleKey
              ? t(item.titleKey)
              : item.defaultTitle || item.id;
            return (
              <Card key={item.id} style={styles.itemCard} elevation="subtle">
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{title}</Text>
                    <Text style={styles.itemPoints}>+{item.points || 20} pts</Text>
                  </View>
                  <Button
                    title="View"
                    variant="secondary"
                    size="sm"
                    onPress={() => navigation.navigate('Activities', {
                      screen: 'ActivityDetail',
                      params: { key: item.id },
                    })}
                  />
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="🤍"
            title={t('profile_liked_title') || 'Liked Activities'}
            message={t('profile_liked_empty')}
            style={styles.emptyContainer}
          />
        )}

        {/* Hidden Activities Section (with restore) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            👁️ {t('profile_hidden_title') || 'Hidden Activities'}
          </Text>
        </View>

        {hiddenActivities && hiddenActivities.length > 0 ? (
          hiddenActivities.map((item) => {
            const title = item.titleKey && t(item.titleKey) !== item.titleKey
              ? t(item.titleKey)
              : item.defaultTitle || item.id;
            return (
              <Card key={item.id} style={styles.itemCard} elevation="subtle">
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{title}</Text>
                  </View>
                  <Button
                    title={`↩️ ${t('btn_restore') || 'Restore'}`}
                    variant="outline"
                    size="sm"
                    onPress={() => handleRestore(item.id)}
                    loading={restoreMutation.isPending}
                  />
                </View>
              </Card>
            );
          })
        ) : (
          <Card style={styles.itemCard} elevation="subtle">
            <Text style={styles.noneText}>{t('profile_hidden_empty')}</Text>
          </Card>
        )}

        {/* Log Out CTA */}
        <View style={styles.logoutContainer}>
          <Button
            title={`🚪 ${t('profile_logout') || 'Log Out'}`}
            variant="danger"
            size="md"
            onPress={onLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
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
  backButton: {
    padding: 6,
    marginRight: SPACING.sm,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: RADII.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userDistrict: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADII.full,
  },
  pointsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginRight: 6,
  },
  pointsValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  settingCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settingValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  itemCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  itemPoints: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: SPACING.md,
  },
  noneText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  logoutContainer: {
    marginTop: SPACING.lg,
  },
});
