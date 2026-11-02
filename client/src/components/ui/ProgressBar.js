import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, RADII, SPACING } from '../../theme';
import { useReducedMotion } from './useReducedMotion';

export default function ProgressBar({
  current = 0,
  total = 7,
  label, // e.g. "3 of 7 days"
  color = COLORS.primary,
  trackColor = '#E5E7EB',
  height = 8,
  showLabel = true,
  style,
}) {
  const reduceMotion = useReducedMotion();
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.max(0, Math.min(current, safeTotal));
  const progressRatio = safeCurrent / safeTotal; // 0 to 1

  const animatedWidth = useRef(new Animated.Value(reduceMotion ? progressRatio : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      animatedWidth.setValue(progressRatio);
    } else {
      Animated.timing(animatedWidth, {
        toValue: progressRatio,
        duration: 400,
        useNativeDriver: false, // layout property width
      }).start();
    }
  }, [progressRatio, reduceMotion]);

  const displayLabel = label || `${safeCurrent} of ${safeTotal} days`;

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      {showLabel ? (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{displayLabel}</Text>
          <Text style={styles.percentageText}>
            {Math.round(progressRatio * 100)}%
          </Text>
        </View>
      ) : null}

      <View style={[styles.track, { height, backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: reduceMotion ? `${progressRatio * 100}%` : widthInterpolated,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  track: {
    width: '100%',
    borderRadius: RADII.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADII.full,
  },
});
