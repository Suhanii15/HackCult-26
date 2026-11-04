import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Chip } from '../../../components/ui';
import { COLORS, SPACING } from '../../../theme';
import { useLanguage, tr } from '../../../i18n/LanguageContext';

export default function FootprintSummaryCard({ monthlyCO2Kg = 106.5 }) {
  const { t } = useLanguage();

  return (
    <Card style={styles.card} elevation="subtle">
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.label}>{t('home_footprint_card_title')}</Text>
          <View style={styles.valRow}>
            <Text style={styles.bigVal}>{monthlyCO2Kg}</Text>
            <Text style={styles.unit}>{tr('kg CO₂e')}</Text>
          </View>
          <Text style={styles.subtext}>
            {t('hero_status_better', { val: '24' })}
          </Text>
        </View>

        <View style={styles.right}>
          <Chip label={tr('Gujarat LiFE')} active={true} />
          <Text style={styles.benchmarkNote}>{tr('~4.1 t/yr benchmark')}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bigVal: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginRight: 6,
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  subtext: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 4,
  },
  benchmarkNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
});
