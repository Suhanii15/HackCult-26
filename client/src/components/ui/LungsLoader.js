import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../theme';
import { useReducedMotion } from './useReducedMotion';

export default function LungsLoader({
  label = 'Breathe in that fresh green energy...',
  size = 110,
  style,
}) {
  const isReducedMotion = useReducedMotion();
  const breathAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isReducedMotion) {
      breathAnim.setValue(0.5);
      return;
    }

    const breathing = Animated.loop(
      Animated.sequence([
        // Inhale: expand lungs smoothly
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        // Pause at full expansion
        Animated.delay(180),
        // Exhale: gentle contraction
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.delay(120),
      ])
    );

    breathing.start();

    return () => {
      breathing.stop();
    };
  }, [isReducedMotion]);

  // Interpolate scale from 0.92 (resting) to 1.10 (inflated)
  const lungScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.10],
  });

  const glowScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.25],
  });

  const glowOpacity = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.65],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Ambient mint breathing glow circle */}
        <Animated.View
          style={[
            styles.glowCircle,
            {
              width: size * 1.1,
              height: size * 1.1,
              borderRadius: (size * 1.1) / 2,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* Animated Stylized Lungs SVG */}
        <Animated.View
          style={{
            width: size,
            height: size,
            transform: [{ scale: lungScale }],
          }}
        >
          <Svg viewBox="0 0 100 100" width={size} height={size}>
            <Defs>
              <RadialGradient id="lungMint" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.95" />
                <Stop offset="75%" stopColor="#6EE7B7" stopOpacity="0.85" />
                <Stop offset="100%" stopColor="#34D399" stopOpacity="0.95" />
              </RadialGradient>
            </Defs>

            {/* Trachea / Central Airway stem */}
            <Path
              d="M 50 14 L 50 38"
              stroke="#047857"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Left & Right Bronchial branches */}
            <Path
              d="M 50 38 Q 42 46 34 50 M 50 38 Q 58 46 66 50"
              stroke="#047857"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Sprouting Eco Leaf Accent at the top */}
            <Path
              d="M 50 16 C 45 10, 44 4, 52 4 C 54 10, 52 14, 50 16 Z"
              fill="#10B981"
            />

            {/* Left Lung Lobe */}
            <Path
              d="M 44 44 
                 C 38 40, 24 44, 20 54 
                 C 16 64, 18 78, 26 84 
                 C 34 89, 44 86, 45 74 
                 C 46 62, 45 50, 44 44 Z"
              fill="url(#lungMint)"
              stroke="#059669"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Right Lung Lobe */}
            <Path
              d="M 56 44 
                 C 62 40, 76 44, 80 54 
                 C 84 64, 82 78, 74 84 
                 C 66 89, 56 86, 55 74 
                 C 54 62, 55 50, 56 44 Z"
              fill="url(#lungMint)"
              stroke="#059669"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Oxygen exchange bubbles inside lobes */}
            <Circle cx="30" cy="62" r="3" fill="#ECFDF5" />
            <Circle cx="35" cy="74" r="2.2" fill="#ECFDF5" />
            <Circle cx="70" cy="62" r="3" fill="#ECFDF5" />
            <Circle cx="65" cy="74" r="2.2" fill="#ECFDF5" />
          </Svg>
        </Animated.View>
      </View>

      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  glowCircle: {
    position: 'absolute',
    backgroundColor: '#CCFBF1',
  },
  label: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
