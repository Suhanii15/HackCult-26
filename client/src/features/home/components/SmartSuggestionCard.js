import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/ui';
import { COLORS, RADII, SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function SmartSuggestionCard({
  suggestion,
  onPress,
}) {
  const { t } = useLanguage();

  const title = suggestion?.title || t('smart_suggestion_desc');
  const saving = suggestion?.saving || '128 kg CO₂';
  const icon = suggestion?.icon || '💡';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('smart_suggestion')}</Text>

      <Card style={styles.card} elevation="subtle" onPress={onPress}>
        <View style={styles.row}>
          {/* Left Thumbnail Box */}
          <View style={styles.thumbnailBox}>
            <Text style={styles.thumbIcon}>{icon}</Text>
          </View>

          {/* Middle Text Details */}
          <View style={styles.textBox}>
            <Text style={styles.descText} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.savingRow}>
              <Text style={styles.savingBold}>{saving}</Text>
            </View>
          </View>

          {/* Right Arrow Button */}
          <View style={styles.arrowBox}>
            <Text style={styles.arrowText}>↗</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  card: {
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbIcon: {
    fontSize: 22,
  },
  textBox: {
    flex: 1,
  },
  descText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingBold: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
});
