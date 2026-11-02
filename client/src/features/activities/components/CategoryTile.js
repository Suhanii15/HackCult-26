import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';

const CATEGORY_META = {
  energy: {
    icon: '⚡',
    color: '#D97706',
    bgColor: '#FEF3C7',
    titleKey: 'cat_energy_name',
    descKey: 'cat_energy_desc',
  },
  transport: {
    icon: '🚲',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    titleKey: 'cat_transport_name',
    descKey: 'cat_transport_desc',
  },
  waste: {
    icon: '♻️',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    titleKey: 'cat_waste_name',
    descKey: 'cat_waste_desc',
  },
  water: {
    icon: '💧',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    titleKey: 'cat_water_name',
    descKey: 'cat_water_desc',
  },
};

export default function CategoryTile({ category, onPress }) {
  const { t } = useLanguage();
  const catKey = category.id || category.key || 'energy';
  const meta = CATEGORY_META[catKey] || {
    icon: category.icon || '🌱',
    color: category.color || COLORS.primary,
    bgColor: '#E8F5E9',
    titleKey: category.titleKey,
    descKey: 'cat_energy_desc',
  };

  const title = meta.titleKey && t(meta.titleKey) !== meta.titleKey
    ? t(meta.titleKey)
    : category.name || category.defaultTitle || catKey;

  const desc = meta.descKey && t(meta.descKey) !== meta.descKey
    ? t(meta.descKey)
    : category.description || '';

  const total = category.totalActivities || category.count || 0;
  const activeCount = category.activeCount || 0;

  return (
    <Card onPress={onPress} style={styles.card} elevation="subtle">
      <View style={styles.container}>
        <View style={[styles.iconBox, { backgroundColor: meta.bgColor }]}>
          <Text style={styles.iconText}>{meta.icon}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {activeCount > 0 ? (
              <View style={styles.activePill}>
                <View style={styles.activeDot} />
                <Text style={styles.activePillText}>
                  {t('activities_actions_active', { count: activeCount })}
                </Text>
              </View>
            ) : null}
          </View>

          {desc ? (
            <Text style={styles.desc} numberOfLines={2}>
              {desc}
            </Text>
          ) : null}

          <View style={styles.footerRow}>
            <Text style={styles.availableText}>
              {t('activities_actions_available', { count: total })}
            </Text>
            <Text style={[styles.arrow, { color: meta.color }]}>➔</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADII.lg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  iconText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 4,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  desc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  arrow: {
    fontSize: 16,
    fontWeight: '700',
  },
});
