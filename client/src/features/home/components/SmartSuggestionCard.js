import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../components/ui';
import { SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { EcoProductIcon, ArrowUpRightIcon } from './HomeIcons';

export default function SmartSuggestionCard({
  suggestion,
  onPress,
}) {
  const { t } = useLanguage();

  const title = suggestion?.title || t('smart_suggestion_desc');
  const saving = suggestion?.saving || '128 kg CO₂';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('smart_suggestion')}</Text>

      <Card style={styles.card} elevation="subtle" onPress={onPress}>
        <View style={styles.row}>
          {/* Left Thumbnail Box */}
          <View style={styles.thumbnailBox}>
            <EcoProductIcon size={30} />
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

          {/* Right Vector Arrow Button */}
          <View style={styles.arrowBox}>
            <ArrowUpRightIcon size={18} color="#64748B" />
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
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    paddingHorizontal: 2,
    letterSpacing: -0.2,
  },
  card: {
    padding: 14,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
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
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textBox: {
    flex: 1,
  },
  descText: {
    fontSize: 13,
    color: '#64748B',
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
    color: '#0F172A',
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
