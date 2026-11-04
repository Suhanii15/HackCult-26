import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Card, Chip } from '../../../components/ui';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { ShieldCheckIcon, ChevronDownIcon, ChevronUpIcon, InfoIcon } from './SolarIcons';

export default function HowCalculatedCollapsible({ assumptions = [] }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  if (!assumptions || assumptions.length === 0) return null;

  return (
    <Card elevation="subtle" style={styles.card}>
      <TouchableOpacity
        onPress={toggleOpen}
        activeOpacity={0.7}
        style={styles.headerRow}
        accessibilityRole="button"
        accessibilityLabel="Toggle calculation details"
      >
        <View style={styles.titleWithIcon}>
          <ShieldCheckIcon size={20} color={COLORS.primary} />
          <Text style={styles.titleText}>
            {t('solar_how_calculated_title') || 'How we calculated this'}
          </Text>
        </View>
        {isOpen ? (
          <ChevronUpIcon size={18} color={COLORS.textSecondary} />
        ) : (
          <ChevronDownIcon size={18} color={COLORS.textSecondary} />
        )}
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.contentContainer}>
          {assumptions.map((item, index) => {
            const isVerified = item.verified === true;
            return (
              <View key={index} style={styles.assumptionItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Chip
                    label={isVerified ? t('solar_badge_verified') || 'Verified' : t('solar_badge_estimate') || 'Estimate'}
                    ease={isVerified ? 'easy' : 'medium'}
                    style={styles.badge}
                  />
                </View>

                <Text style={styles.itemValue}>
                  {item.value} {item.unit && item.unit !== 'INR' ? `(${item.unit})` : ''}
                </Text>

                {item.source && (
                  <Text style={styles.itemSource}>
                    Source: {item.source} {item.asOf ? `• As of ${item.asOf}` : ''}
                  </Text>
                )}

                {item.note && (
                  <View style={styles.noteBox}>
                    <InfoIcon size={14} color="#92400E" />
                    <Text style={styles.itemNote}>{item.note}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  titleText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  contentContainer: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  assumptionItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemLabel: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  itemValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSource: {
    ...TYPOGRAPHY.subtext,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warningBg,
    padding: SPACING.xs,
    borderRadius: RADII.sm,
    marginTop: 4,
    gap: 6,
  },
  itemNote: {
    ...TYPOGRAPHY.subtext,
    color: '#92400E',
    fontSize: 12,
    flex: 1,
  },
});
