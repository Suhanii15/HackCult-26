import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, RADII, SPACING } from '../../theme';
import { useReducedMotion } from './useReducedMotion';

export default function ProgressBar({
  current = 0,
  value,
  progress,
  total = 7,
  label, // e.g. "1 of 7 check-ins completed"
  threshold, // e.g. 5
  thresholdLabel,
  color = COLORS.primary,
  trackColor = '#E5E7EB',
  height = 8,
  showLabel = true,
  style,
}) {
  const reduceMotion = useReducedMotion();
  const rawCurrent = value !== undefined ? value : progress !== undefined ? progress * total : current;
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.max(0, Math.min(rawCurrent, safeTotal));
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

  const displayLabel = label || `${safeCurrent} of ${safeTotal} check-ins completed`;

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
              width: widthInterpolated,
              backgroundColor: color,
              height,
            },
          ]}
        />
        {/* Optional threshold marker indicator if threshold provided */}
        {threshold && threshold < safeTotal ? (
          <View
            style={[
              styles.thresholdMarker,
              { left: `${(threshold / safeTotal) * 100}%` },
            ]}
          />
        ) : null}
      </View>

      {thresholdLabel ? (
        <Text style={styles.thresholdText}>{thresholdLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark || '#00695C',
  },
  track: {
    width: '100%',
    borderRadius: RADII.full || 8,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    borderRadius: RADII.full || 8,
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#F59E0B',
    zIndex: 2,
  },
  thresholdText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 5,
    lineHeight: 16,
  },
});
