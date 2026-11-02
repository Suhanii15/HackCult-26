import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { RADII } from '../../theme';
import { useReducedMotion } from './useReducedMotion';

export default function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = RADII.sm,
  style,
}) {
  const reduceMotion = useReducedMotion();
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacityAnim.setValue(0.5);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0', // slate-200
  },
});
