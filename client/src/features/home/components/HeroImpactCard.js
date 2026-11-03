import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Card } from '../../../components/ui';
import { SPACING } from '../../../theme';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function HeroImpactCard({
  savedCO2Kg = 42,
  percentChange = 18,
}) {
  const { t } = useLanguage();

  return (
    <Card style={styles.card} elevation="subtle">
      <View style={styles.contentRow}>
        {/* Left Information */}
        <View style={styles.leftCol}>
          <Text style={styles.caption}>{t('your_impact_this_month')}</Text>

          <Text style={styles.heroNumber}>{savedCO2Kg}</Text>

          <Text style={styles.unitText}>{t('kg_co2_saved')}</Text>

          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>{t('vs_last_month')}</Text>
          </View>
        </View>

        {/* Right Illustration: Soft Eco Cloud Graphic in pastel green palette */}
        <View style={styles.rightCol}>
          <View style={styles.illustrationWrapper}>
            <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
              <Defs>
                <LinearGradient id="cloudGrad" x1="16" y1="20" x2="80" y2="76">
                  <Stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.95" />
                  <Stop offset="50%" stopColor="#6EE7B7" stopOpacity="0.9" />
                  <Stop offset="100%" stopColor="#34D399" stopOpacity="0.85" />
                </LinearGradient>
                <LinearGradient id="bubbleGrad" x1="0" y1="0" x2="96" y2="96">
                  <Stop offset="0%" stopColor="#E0F2F1" stopOpacity="0.95" />
                  <Stop offset="100%" stopColor="#B2DFDB" stopOpacity="0.5" />
                </LinearGradient>
              </Defs>

              {/* Background soft pastel aura bubble */}
              <Circle cx="48" cy="48" r="42" fill="url(#bubbleGrad)" />

              {/* Puffy Cloud Canopy */}
              <Path
                d="M66 58H30C23.3726 58 18 52.6274 18 46C18 39.8824 22.5804 34.8239 28.5369 34.0955C30.4079 26.0461 37.6047 20 46.2 20C55.6793 20 63.4687 27.2361 64.3853 36.5649C69.7548 37.4912 73.8 42.1287 73.8 47.7C73.8 53.3885 69.4115 58 63.723 58H66Z"
                fill="url(#cloudGrad)"
              />

              {/* Downward CO2 reduction arrow */}
              <Path
                d="M48 36V50M48 50L43 45M48 50L53 45"
                stroke="#065F46"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    padding: 20,
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
  },
  caption: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  heroNumber: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 10,
  },
  pillBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  rightCol: {
    marginLeft: SPACING.sm,
  },
  illustrationWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
