import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../theme';

export default function ChevronMeter({
  level = 1, // 0 to 5
  max = 5,
  accentColor = COLORS.accent,
  inactiveColor = '#D1D5DB', // light gray
  size = 18,
  style,
}) {
  const safeLevel = Math.max(0, Math.min(Math.round(level), max));
  const chevrons = Array.from({ length: max }, (_, index) => index < safeLevel);

  return (
    <View style={[styles.container, style]}>
      {chevrons.map((isFilled, index) => (
        <Svg
          key={index}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          style={styles.chevron}
        >
          <Path
            d="M9 5l7 7-7 7"
            stroke={isFilled ? accentColor : inactiveColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: -4, // tight chevron overlap for authentic meter look
  },
});
