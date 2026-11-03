import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Card } from '../../../components/ui';
import { COLORS, SPACING } from '../../../theme';
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

        {/* Right Illustration: Soft Eco Cloud Graphic in brand teal palette */}
        <View style={styles.rightCol}>
          <View style={styles.illustrationWrapper}>
            <Svg width={92} height={92} viewBox="0 0 92 92" fill="none">
              <Defs>
                <LinearGradient id="tealCloudGrad" x1="0" y1="0" x2="92" y2="92">
                  <Stop offset="0%" stopColor="#80CBC4" stopOpacity="0.85" />
                  <Stop offset="100%" stopColor="#4DB6AC" stopOpacity="0.95" />
                </LinearGradient>
                <LinearGradient id="tealCircleGrad" x1="0" y1="0" x2="92" y2="92">
                  <Stop offset="0%" stopColor="#E0F2F1" stopOpacity="0.95" />
                  <Stop offset="100%" stopColor="#B2DFDB" stopOpacity="0.6" />
                </LinearGradient>
              </Defs>

              {/* Background soft teal glow bubble */}
              <Circle cx="46" cy="46" r="40" fill="url(#tealCircleGrad)" />

              {/* Organic Cloud / Canopy shape in brand teal */}
              <Path
                d="M60 54H30C24.4772 54 20 49.5228 20 44C20 38.7822 24.0006 34.5009 29.1322 34.0434C30.7905 27.176 36.9844 22 44.4 22C52.5516 22 59.2662 28.1158 60.2618 36.0278C64.5937 36.8091 68 40.6186 68 45.2C68 50.0601 64.4183 54 60 54Z"
                fill="url(#tealCloudGrad)"
              />

              {/* Downward Arrow (CO2 reduction indicator in brand deep teal) */}
              <Path
                d="M46 34V47M46 47L41 42M46 47L51 42"
                stroke="#004D40"
                strokeWidth="2.8"
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
    borderWidth: 1.2,
    borderColor: 'rgba(224, 242, 241, 0.8)',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
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
    color: '#00695C',
    marginBottom: 4,
  },
  heroNumber: {
    fontSize: 38,
    fontWeight: '800',
    color: '#004D40',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  pillBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2F1', // Brand mint tint
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00695C', // Brand dark teal
  },
  rightCol: {
    marginLeft: SPACING.sm,
  },
  illustrationWrapper: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
